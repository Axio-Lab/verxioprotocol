import { Request, Response, NextFunction } from "express";
import AuthRequest from "../interfaces/auth.interface";
import UserService from "../services/profile.services";
import ApiKey from "../services/apiKey.service";
const {
    findOne
} = new UserService();
const ApiKeyService = new ApiKey();

export default async function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const apiKey = req.header('X-API-Key');

        if (!apiKey) {
            return res.status(401).send({
                success: false,
                message: "Please provide API-Key"
            });
        }

        if (apiKey) {
            const foundApiKey = await ApiKeyService.findOne({ key: apiKey, isValid: true })

            if (!foundApiKey) {
                return res.status(404).send({
                    success: false,
                    message: "No Api Key found"
                });
            }

            const authenticatedUser = await findOne({ _id: foundApiKey.userId });
            if (!authenticatedUser) {
                return res.status(404).send({
                    success: false,
                    message: "User not found"
                });
            }

            (req as AuthRequest).user = authenticatedUser;
            next();

        }
    } catch (error: any) {
        return res.status(500).send({
            success: false,
            message: `Unexpected Error: ${error.message}`
        });
    }
}