// import candypay from "../configs/candypay.config";
import IProduct from "../interfaces/product.interface";
import Profile from "./profile.services";
const ProfileService = new Profile();

export default class PaymentService {

    // async createCandypaySession(product: IProduct) {
    //     const profile = await ProfileService.findOne({_id: product.userId});
    //     if(!profile) throw new Error("Seller doesn't exist");

    //     return await candypay.session.create({
    //         success_url: product.productFile,
    //         cancel_url: "https://www.jumia.ng",
    //         tokens: ["bonk"],
    //         items: [
    //             {
    //                 name: product.name,
    //                 price: product.price || 20,
    //                 image: product.image,
    //                 quantity: 1
    //             }
    //         ],
    //         // discounts: {
    //         //     collection_id: product.nftSelection.address,
    //         //     discount: (product.discountAmount || 0) / 100,
    //         //     name: product.nftSelection.name,
    //         //     image: product.nftSelection.imageUrl,
    //         // },
    //         custom_data: {
    //             name: profile.email!,
    //             image: profile.imageUrl!,
    //             wallet_address: profile._id
    //         },
    //         metadata: {
    //             productId: product._id,
    //             productName: product.name,
    //             product: product.productFile,
    //             // pop: product.pop,
    //             name: profile.email!,
    //             image: profile.imageUrl!,
    //             wallet_address: profile._id
    //         }
    //     });
    // }
}