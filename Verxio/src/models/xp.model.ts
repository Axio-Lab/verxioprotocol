import { model, Schema } from "mongoose";
import IXP from "../interfaces/xp.interface";
import { DATABASES } from "../configs/constants.configs";

const XPSchema = new Schema<IXP>({
    point: {
        type: Number,
        required: true,
        unique: false
    },
    userId: {
        type: String,
        required: true,
        ref: DATABASES.PROFILE
    },
    time: {
        type: Date,
        required: true,
        unique: false
    }
}, {
    strict: true,
    timestamps: true,
    versionKey: false
});

const XP = model<IXP>(DATABASES.XP, XPSchema, DATABASES.XP);
export default XP;