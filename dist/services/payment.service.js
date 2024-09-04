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
const candypay_config_1 = __importDefault(require("../configs/candypay.config"));
const profile_services_1 = __importDefault(require("./profile.services"));
const ProfileService = new profile_services_1.default();
class PaymentService {
    createCandypaySession(product) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield ProfileService.findOne({ _id: product.userId });
            if (!profile)
                throw new Error("Seller doesn't exist");
            return yield candypay_config_1.default.session.create({
                success_url: product.productFile,
                cancel_url: "https://www.jumia.ng",
                tokens: ["bonk"],
                items: [
                    {
                        name: product.name,
                        price: product.price || 20,
                        image: product.image,
                        quantity: 1
                    }
                ],
                // discounts: {
                //     collection_id: product.nftSelection.address,
                //     discount: (product.discountAmount || 0) / 100,
                //     name: product.nftSelection.name,
                //     image: product.nftSelection.imageUrl,
                // },
                custom_data: {
                    name: profile.email,
                    image: profile.imageUrl,
                    wallet_address: profile._id
                },
                metadata: {
                    productId: product._id,
                    productName: product.name,
                    product: product.productFile,
                    // pop: product.pop,
                    name: profile.email,
                    image: profile.imageUrl,
                    wallet_address: profile._id
                }
            });
        });
    }
}
exports.default = PaymentService;
