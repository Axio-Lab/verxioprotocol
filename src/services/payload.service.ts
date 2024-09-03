import Payload from "../models/payload.model";

export default class PayloadService {
    async create(payload: {}) {
        return await Payload.create(payload);
    }

    async findOne(filter: {}) {
        return await Payload.findOne(filter);
    }

    async update(params: {}, data: {}) {
        return await Payload.findOneAndUpdate(params, data, { new: true });
    }
}