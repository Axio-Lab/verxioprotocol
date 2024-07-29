import { model, Schema } from "mongoose";
import IApiKey from "../interfaces/apiKey.interface";
import { DATABASES } from "../configs/constants.configs";

const apiKeySchema = new Schema<IApiKey>({
    key: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    isValid: {
        type: Boolean,
        required: true
    }
}, {
    strict: true,
    timestamps: true,
    versionKey: false
});

const ApiKey = model<IApiKey>(DATABASES.API_KEY, apiKeySchema, DATABASES.API_KEY);
export default ApiKey;