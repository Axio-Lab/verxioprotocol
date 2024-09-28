import { model, Schema } from "mongoose";
import { DATABASES } from "../configs/constants.configs";
import ISubmission from "../interfaces/submission.interface";

const submissionSchema = new Schema<ISubmission>({
    userId: {
        type: String,
        required: true,
        ref: DATABASES.PROFILE
    },
    campaignId: {
        type: String,
        required: true,
        trim: true
    },
    submission: {
        type: String,
        required: true,
        trim: true
    },
}, {
    strict: true,
    timestamps: true,
    versionKey: false
});

const Submission = model(DATABASES.SUBMISSION, submissionSchema, DATABASES.SUBMISSION);
export default Submission;