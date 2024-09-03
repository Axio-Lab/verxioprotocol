import { Document, ObjectId } from 'mongoose';

export default interface IXP extends Document {
    point: number;
    userId: string;
    time: Date;
}