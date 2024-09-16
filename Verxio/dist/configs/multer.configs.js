"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({});
// Check file type
function checkFileType(file, cb) {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png/;
    // Check extension
    const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only JPEG, JPG, and PNG files are allowed.'));
    }
}
// Initialize upload variable
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: function (_req, file, cb) {
        checkFileType(file, cb);
    }
});
exports.default = upload;
