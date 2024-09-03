import { model, Schema } from "mongoose";
import IParticipation from "../interfaces/participation.interface";
import { DATABASES } from "../configs/constants.configs";

const ParticipationSchema = new Schema<IParticipation>({
    userAddress: {
        type: String,
        required: true
    },
    campaignId: {
        type: String,
        required: true,
        ref: DATABASES.CAMPAIGN
    },
    actions: [{
        _id: {
            type: String,
            required: true,
            trim: true
        },
        xpClaimed: {
            type: Number,
            required: true
        },
    }],
    date: {
        type: Date,
        required: true,
        unique: false
    }
}, {
    strict: true,
    timestamps: true,
    versionKey: false
});

const Participation = model<IParticipation>(DATABASES.PARTICIPATION, ParticipationSchema, DATABASES.PARTICIPATION);
export default Participation;