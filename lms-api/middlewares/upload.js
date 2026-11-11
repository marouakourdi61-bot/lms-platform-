const multer = require("multer");
const { randomUUID } = require("crypto");

const fileExtensions = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const filename = randomUUID() + fileExtensions[file.mimetype];
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (fileExtensions[file.mimetype]) {
    return cb(null, true);
  }

  const error = new Error("Only PDF, JPEG and PNG files are allowed");
  error.statusCode = 400;
  cb(error);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;
