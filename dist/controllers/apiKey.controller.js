"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiKey_service_1 = __importDefault(require("../services/apiKey.service"));
const ApiKeyService = new apiKey_service_1.default();
class ApiKeyController {
    generateApiKey(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const foundKey = yield ApiKeyService.findOne({ userId, isValid: true });
                if (foundKey) {
                    return res.status(409).send({
                        success: false,
                        message: "User already has an Api Key."
                    });
                }
                const apiKey = yield ApiKeyService.create(userId);
                return res.status(201).send({
                    success: true,
                    message: "ApiKey generated successfully, please store this key cause it can't be retrieved after this request",
                    data: apiKey.key
                });
            }
            catch (error) {
                return res.status(500).send({
                    success: false,
                    message: `Error generating Api Key: ${error.message}`
                });
            }
        });
    }
    invalidateApiKey(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const apiKey = yield ApiKeyService.findOne({ userId: req.params.userId, isValid: true });
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
                yield apiKey.save();
                return res.status(200).send({
                    success: true,
                    message: "Api Key invalidated succesfully"
                });
            }
            catch (error) {
                return res.status(500).send({
                    success: false,
                    message: `Error invalidating Api Key: ${error.message}`
                });
            }
        });
    }
}
exports.default = ApiKeyController;
