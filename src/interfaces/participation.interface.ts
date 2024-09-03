import { Document } from 'mongoose';

export default interface IParticipation extends Document {
    userAddress: string;
    campaignId: string;
    actions: [{
        _id: string;
        xpClaimed: number;
    }];
    date: Date;
}