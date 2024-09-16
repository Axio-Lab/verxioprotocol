"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controllers_1 = __importDefault(require("../controllers/product.controllers"));
const validate_middleware_1 = __importDefault(require("../middlewares/validate.middleware"));
const product_schema_1 = require("../schemas/product.schema");
const authenticate_middleware_1 = __importDefault(require("../middlewares/authenticate.middleware"));
const router = (0, express_1.Router)();
const { createProduct, getProductById, getUserProduct } = new product_controllers_1.default();
//create a product
router.post("/", authenticate_middleware_1.default, (0, validate_middleware_1.default)(product_schema_1.createProductSchema), createProduct);
//get user's products by Id
router.get("/user", authenticate_middleware_1.default, getUserProduct);
//get product by Id
router.get("/:id", authenticate_middleware_1.default, getProductById);
exports.default = router;
