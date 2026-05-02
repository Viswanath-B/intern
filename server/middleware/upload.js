import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";

// Configure S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "application/pdf"
]);

const storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME,
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    const isPdf = file.mimetype === "application/pdf";
    const folder = "internship-applications/";
    const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    cb(null, folder + filename);
  },
  contentType: multerS3.AUTO_CONTENT_TYPE,
});

function fileFilter(request, file, callback) {
  if (allowedMimeTypes.has(file.mimetype)) {
    callback(null, true);
    return;
  }

  const uploadError = new Error("Receipt must be an image or PDF file.");
  uploadError.statusCode = 400;
  callback(uploadError);
}

export const receiptUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});
