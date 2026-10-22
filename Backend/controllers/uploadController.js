exports.uploadPropertyImages = (req, res) => {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ message: "Choose at least one image" });

  const host = `${req.protocol}://${req.get("host")}`;
  const images = files.map((file) => ({
    filename: file.filename,
    url: `${host}/uploads/${file.filename}`,
  }));

  res.status(201).json({ message: "Images uploaded", images });
};
