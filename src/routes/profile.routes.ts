import { Router } from "express";
import ProfileController from '../controllers/profile.controllers';
import validate from "../middlewares/validate.middleware";
import { profileSchema } from "../schemas/profile.schemas";
import upload from "../configs/multer.configs";
const router = Router();
const {
    createProfile,
    uploadImage,
    getProfile
} = new ProfileController();

//create or update a profile
router.put("/:id", validate(profileSchema), createProfile);

//upload profile image
router.post("/image", upload.single("image"), uploadImage);

//get a profile
router.get("/:id", getProfile);

export default router;