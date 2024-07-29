import IProduct from "../interfaces/product.interface";
import Product from "../models/product.model";

export default class ProductService {
    async create(product: Partial<IProduct>) {
        return await Product.create(product);
    }

    async getProductById(id: string) {
        return await Product.findById(id)
        // .populate("userId", ["firstName", "lastName"]);
    }

    async getProduct(id: string) {
        const product = await Product.findById(id)
        // .populate("userId", ["firstName", "lastName"]);
        if (!product) throw new Error("Invalid ProductId");
        return product;
    }

    async getProductByQuery(query: Partial<IProduct>) {
        const product = await Product.findOne(query);
        return product;
    }

    async getProducts(query: Partial<IProduct>) {
        const products = await Product.find(query);
        return products;
    }
}