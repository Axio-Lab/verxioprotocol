import { Router } from "express";
import ProductController from '../controllers/product.controllers';
import validate from "../middlewares/validate.middleware";
import { createProductSchema } from "../schemas/product.schema";
import validateEmptyString from "../middlewares/validateEmptyString.middleware";
import authenticate from "../middlewares/authenticate.middleware";
const router = Router();
const {
    createProduct,
    getProductById,
    getUserProduct
} = new ProductController();

//create a product
router.post("/", authenticate, validate(createProductSchema), createProduct);

//get user's products by Id
router.get("/user", authenticate, getUserProduct);

//get product by Id
router.get("/:id", authenticate, getProductById);

export default router;