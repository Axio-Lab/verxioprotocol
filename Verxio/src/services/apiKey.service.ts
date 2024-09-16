import { FilterQuery } from "mongoose";
import { randomBytes } from "crypto";

import IApiKey from "../interfaces/apiKey.interface";
import ApiKey from "../models/apiKey.model";


export default class ApiKeyService {
    async create(userId: string) {
        return await ApiKey.create({
            key: this.generateApiKey(),
            userId,
            isValid: true
        });
    }

    async findOne(query: FilterQuery<IApiKey>) {
        return await ApiKey.findOne(query);

    }

    generateApiKey() {
        return randomBytes(20).toString('hex');
    }
}
