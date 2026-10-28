// Placeholder until an AI provider is connected. Verified property data must come from the database.
export const parseAccommodationQuery = (req, res) =>
  res.json({ originalQuery: req.body.query || "", interpretedFilters: {}, status: "placeholder", message: "AI provider not connected yet. Verified property data must come from the database." });
