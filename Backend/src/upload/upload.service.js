import ApiError from "../utils/ApiError.js";

// Files are already on disk (uploadMiddleware); turn them into absolute URLs the client stores in property.images.
export function toImageUrls(files = [], baseUrl) {
  if (!files.length) throw ApiError.badRequest("Choose at least one image");
  return files.map((file) => ({ filename: file.filename, url: `${baseUrl}/uploads/${file.filename}` }));
}
