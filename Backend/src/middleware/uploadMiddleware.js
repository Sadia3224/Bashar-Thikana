import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import ApiError from "../utils/ApiError.js";
import { MAX_PROPERTY_IMAGES } from "../utils/constants.js";

// Backend/uploads (two levels up from src/middleware).
export const uploadDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_TYPES = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  // Extension comes from the checked MIME type, never from the client's filename.
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ALLOWED_TYPES[file.mimetype]}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: MAX_PROPERTY_IMAGES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES[file.mimetype]) cb(null, true);
    else cb(ApiError.badRequest("Only JPG, PNG and WebP images are allowed"));
  },
});

// Multipart field name is "images".
export const propertyImages = upload.array("images", MAX_PROPERTY_IMAGES);

export default upload;
