import { Request, Response } from "express";
import { MESSAGES } from "../configs/constants.configs";
import ProfileService from "../services/profile.services";
import cloudinary from "../configs/cloudinary.configs";
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
    const { email } = req.body;

    //checks if profile with email and id exists
    if (email) {
      const profileFromEmail = await findOne({ email: email });
      if (profileFromEmail) {
        if (profileFromEmail._id !== id) {
          //sends an error if the email exists
          return res.status(409)
            .send({
              success: false,
              message: DUPLICATE_EMAIL
            });
        }
      }
    }

    const profileFromId = await findOne({ _id: id });
    if (profileFromId) {

      const updatedProfile = await editById(id, req.body);
      return res.status(201)
        .send({
          success: true,
          message: UPDATED,
          profile: updatedProfile
        });
    } else {
      //creates a profile if the email and id doesn't exist
      const createdProfile = await create({ _id: id, ...req.body });

      return res.status(201)
        .send({
          success: true,
          message: CREATED,
          profile: createdProfile
        });
    }
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