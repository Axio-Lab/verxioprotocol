import { Request, Response } from "express";
import { MESSAGES } from "../configs/constants.configs";
import ProfileService from "../services/profile.services";
import cloudinary from "../configs/cloudinary.configs";
import { Reclaim } from '@reclaimprotocol/js-sdk';

const {
  create,
  findOne,
  editById
} = new ProfileService();
const {
  DUPLICATE_EMAIL,
  CREATED,
  FETCHED,
  UPDATED,
  NOT_FOUND
} = MESSAGES.PROFILE;

export default class ProfileController {
  async createProfile(req: Request, res: Response) {
    const { id } = req.params;

    const profileFromId = await findOne({ _id: id });
    if (profileFromId) {

      const profile = await findOne({ _id: id });
      return res.status(200)
        .send({
          success: true,
          message: FETCHED,
          profile: profile
        });
    } else {
      //creates a profile if id doesn't exist
      const createdProfile = await create({ _id: id, ...req.body });

      return res.status(201)
        .send({
          success: true,
          message: CREATED,
          profile: createdProfile
        });
    }
  }

  async verifyUser(req: Request, res: Response) {
    const userId = req.body.userId; // Get userId from request body
    const profile = await findOne({ _id: userId });
    if (!profile) {
      return res.status(404)
        .send({
          success: false,
          message: NOT_FOUND
        });
    }
    const sessionId = userId; // Generate a new session ID

    const APP_ID = "0xc0A6468c80110F7762A3de8b71A77c2a09EC0129";
    const APP_SECRET = "0xca795119790f8818430cda2753b91edc1a3824de222d8c74848a6cab63edffc9";
    const PROVIDERS = {
      "github_username": "6d3f6753-7ee6-49ee-a545-62f1b1822ae5",
      "gmail": "f9f383fd-32d9-4c54-942f-5e9fda349762",
      "yc_founder_details": "0bc34db6-bae2-48ca-b864-9f1094defedc"
    }

    const reclaimClient = new Reclaim.ProofRequest(APP_ID, sessionId as any);
    reclaimClient.addContext(
      (userId),
      (`For verification on ${new Date()}`)
    )
    
    await reclaimClient.buildProofRequest(PROVIDERS.gmail as any, true, 'V2Linking');
    reclaimClient.setRedirectUrl(`https://www.verxio.xyz/dashboard/profile`)
    reclaimClient.setSignature(await reclaimClient.generateSignature(APP_SECRET));

    const { requestUrl, statusUrl } = await reclaimClient.createVerificationRequest();
    console.log("requestUrl", requestUrl);
    console.log("statusUrl", statusUrl);

    await reclaimClient.startSession({
      onSuccessCallback: async proof => {
        console.log('Verification success', proof)
        profile.isVerified = true;
        await profile?.save();
        // Your business logic here
      },
      onFailureCallback: error => {
        console.error('Verification failed', error)
        // Your business logic here to handle the error
      }
    })

    // Send the request and status URLs back to the client
    res.json({ requestUrl, statusUrl });
  }

  async uploadImage(req: Request, res: Response) {
    try {
      let imageUrl;
      if (req.file) {
        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, { folder: "Verxio" });
        imageUrl = result.secure_url;
        if (!imageUrl) {
          return res.status(409).send({
            success: false,
            message: "File Upload Failed"
          });
        }
        return res.status(201)
          .send({
            success: true,
            message: "Image uploaded successfully",
            imageUrl
          });
      }
      return res.status(409).send({
        success: false,
        message: "Include an Image file"
      });
    } catch (err) {
      return res.status(409).send({
        success: false,
        message: "Error while uploading file"
      });
    }
  }

  async getProfile(req: Request, res: Response) {
    const profile = await findOne({ _id: req.params.id });
    if (profile) {
      return res.status(200)
        .send({
          success: true,
          message: FETCHED,
          profile: profile
        });
    }
    return res.status(404)
      .send({
        success: false,
        message: NOT_FOUND
      });
  }
}
