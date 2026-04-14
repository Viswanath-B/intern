import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDirectory = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "application/pdf"
]);

const storage = multer.diskStorage({
  destination(request, file, callback) {
    callback(null, uploadDirectory);
  },
  filename(request, file, callback) {
    const safeFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeFileName}`;
    callback(null, uniqueName);
  }
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
