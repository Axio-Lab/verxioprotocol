import multer from "multer";
import path from "path";

const storage = multer.diskStorage({});

// Check file type
function checkFileType(file: Express.Multer.File, cb: multer.FileFilterCallback) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
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
const upload = multer({
  storage: storage,
  fileFilter: function (_req, file, cb) {
    checkFileType(file, cb);
  }
});

export default upload;