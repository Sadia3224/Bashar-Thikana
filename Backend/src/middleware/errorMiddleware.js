import multer from "multer";
import mongoose from "mongoose";
import { isProduction } from "../config/env.js";

export const notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });

// Maps known error types to a status code and a client-safe message.
function describe(err) {
  if (err.statusCode) return [err.statusCode, err.message];
  if (err instanceof mongoose.Error.ValidationError) return [400, Object.values(err.errors).map((e) => e.message).join(", ")];
  if (err instanceof mongoose.Error.CastError) return [400, `Invalid value for ${err.path}`];
  if (err.code === 11000) return [409, `${Object.keys(err.keyValue || {}).join(", ") || "Value"} already exists`];
  if (err instanceof multer.MulterError) return [400, err.code === "LIMIT_FILE_SIZE" ? "Each image must be 5 MB or smaller" : err.message];
  if (err.type === "entity.parse.failed") return [400, "Request body is not valid JSON"];
  return [500, isProduction ? "Something went wrong" : err.message];
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const [status, message] = describe(err);
  if (status >= 500) console.error(err);
  res.status(status).json({ message });
}
