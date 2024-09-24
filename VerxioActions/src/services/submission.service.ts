import ISubmission from "../interfaces/submission.interface";
import Submission from "../models/submission.model";


export default class SubmissionService {
    async create(submission: Partial<ISubmission>) {
        return await Submission.create(submission);
    }

    async findOne(params: {}) {
        return await Submission.findOne(params);
    }

    async find(params: {}) {
        return await Submission.find(params);
    }
}