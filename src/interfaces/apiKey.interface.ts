import { Document, ObjectId } from 'mongoose';

export default interface IApiKey extends Document {
    key: string;
    userId: ObjectId;
    isValid: boolean;
}