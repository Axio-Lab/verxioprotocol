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
const profile_models_1 = __importDefault(require("../models/profile.models"));
class ProfileService {
    create(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            const createdProfile = yield profile_models_1.default.create(profile);
            return yield profile_models_1.default.findOne({ _id: createdProfile.id }, "-__v");
        });
    }
    findOne(param) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield profile_models_1.default.findOne(param, "-__v");
        });
    }
    editById(id, obj) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield profile_models_1.default.findByIdAndUpdate(id, { $set: obj }, { new: true });
        });
    }
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield profile_models_1.default.countDocuments();
        });
    }
}
exports.default = ProfileService;
