"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_configs_1 = require("../configs/constants.configs");
const profile_services_1 = __importDefault(require("../services/profile.services"));
const cloudinary_configs_1 = __importDefault(require("../configs/cloudinary.configs"));
const js_sdk_1 = require("@reclaimprotocol/js-sdk");
const { create, findOne, editById } = new profile_services_1.default();
const { DUPLICATE_EMAIL, CREATED, FETCHED, UPDATED, NOT_FOUND } = constants_configs_1.MESSAGES.PROFILE;
class ProfileController {
    createProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const profileFromId = yield findOne({ _id: id });
            if (profileFromId) {
                const profile = yield findOne({ _id: id });
                return res.status(200)
                    .send({
                    success: true,
                    message: FETCHED,
                    profile: profile
                });
            }
            else {
                //creates a profile if id doesn't exist
                const createdProfile = yield create(Object.assign({ _id: id }, req.body));
                return res.status(201)
                    .send({
                    success: true,
                    message: CREATED,
                    profile: createdProfile
                });
            }
        });
    }
    verifyUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.body.userId; // Get userId from request body
            const profile = yield findOne({ _id: userId });
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
            };
            const reclaimClient = new js_sdk_1.Reclaim.ProofRequest(APP_ID, sessionId);
            yield reclaimClient.buildProofRequest(PROVIDERS.gmail);
            reclaimClient.setSignature(yield reclaimClient.generateSignature(APP_SECRET));
            const { requestUrl, statusUrl } = yield reclaimClient.createVerificationRequest();
            console.log("requestUrl", requestUrl);
            console.log("statusUrl", statusUrl);
            // Send the request and status URLs back to the client
            res.json({ requestUrl, statusUrl });
            yield reclaimClient.startSession({
                onSuccessCallback: (proof) => __awaiter(this, void 0, void 0, function* () {
                    console.log('Verification success', proof);
                    profile.isVerified = true;
                    yield (profile === null || profile === void 0 ? void 0 : profile.save());
                    // Your business logic here
                }),
                onFailureCallback: error => {
                    console.error('Verification failed', error);
                    // Your business logic here to handle the error
                }
            });
        });
    }
    uploadImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let imageUrl;
                if (req.file) {
                    // Upload file to Cloudinary
                    const result = yield cloudinary_configs_1.default.uploader.upload(req.file.path, { folder: "Verxio" });
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
            }
            catch (err) {
                return res.status(409).send({
                    success: false,
                    message: "Error while uploading file"
                });
            }
        });
    }
    getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield findOne({ _id: req.params.id });
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
        });
    }
}
exports.default = ProfileController;
