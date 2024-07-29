import { model, Schema } from "mongoose";
import { DATABASES } from "../configs/constants.configs";

const profileSchema = new Schema({
  _id: {
    type: String,
    required: true,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    sparse: true,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  }
}, {
  strict: false,
  timestamps: true
});

const Profile = model(DATABASES.PROFILE, profileSchema, DATABASES.PROFILE);
export default Profile;