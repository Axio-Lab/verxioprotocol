import { Router } from "express";
import ProfileController from '../controllers/profile.controllers';
import upload from "../configs/multer.configs";
const router = Router();
const {
    createProfile,
    uploadImage,
    getProfile,
    verifyUser
} = new ProfileController();

//verify user
router.post("/verify-user", verifyUser);

//upload profile image
router.post("/image", upload.single("image"), uploadImage);

//create or fetches a profile
router.post("/:id", createProfile);

//get a profile
router.get("/:id", getProfile);

export default router;