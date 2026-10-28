import { toImageUrls } from "./upload.service.js";

export const uploadPropertyImages = (req, res) => {
  const images = toImageUrls(req.files, `${req.protocol}://${req.get("host")}`);
  res.status(201).json({ message: "Images uploaded", images });
};
