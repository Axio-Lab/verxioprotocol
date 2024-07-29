import { Request, Response } from "express";

import ApiKey from "../services/apiKey.service";

const ApiKeyService = new ApiKey();


export default class ApiKeyController {

    async generateApiKey(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            const foundKey = await ApiKeyService.findOne({ userId, isValid: true });

            if (foundKey) {
                return res.status(409).send({
                    success: false,
                    message: "User already has an Api Key."
                });
            }

            const apiKey = await ApiKeyService.create(userId);

            return res.status(201).send({
                success: true,
                message: "ApiKey generated successfully, please store this key cause it can't be retrieved after this request",
                data: apiKey.key
            });

        } catch (error: any) {
            return res.status(500).send({
                success: false,
                message: `Error generating Api Key: ${error.message}`
            });
        }
    }

    async invalidateApiKey(req: Request, res: Response) {
        try {
            const apiKey = await ApiKeyService.findOne({ userId: req.params.userId, isValid: true })

            if (!apiKey) {
                return res.status(404).send({
                    success: false,
                    message: "No Api Key found"
                });
            }

            if (!apiKey.isValid) {
                return res.status(409).send({
                    success: false,
                    message: "Api Key has already been invalidated."
                });
            }

            apiKey.isValid = false;
            await apiKey.save();

            return res.status(200).send({
                success: true,
                message: "Api Key invalidated succesfully"
            });
        } catch (error: any) {
            return res.status(500).send({
                success: false,
                message: `Error invalidating Api Key: ${error.message}`
            });
        }
    }
}