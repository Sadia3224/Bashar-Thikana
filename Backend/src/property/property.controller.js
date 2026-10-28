import * as propertyService from "./property.service.js";

export const getPublicProperties = async (req, res) => {
  const properties = await propertyService.searchPublic(req.query);
  res.json({ count: properties.length, properties });
};

export const getPropertyById = async (req, res) => {
  const property = await propertyService.getVisibleById(req.params.id, req.user);
  res.json({ property });
};

export const getMyProperties = async (req, res) => {
  const properties = await propertyService.listByOwner(req.user._id);
  res.json({ count: properties.length, properties });
};

export const createProperty = async (req, res) => {
  const property = await propertyService.createListing(req.user._id, req.body);
  res.status(201).json({ message: "Property submitted for review", property });
};

export const updateMyProperty = async (req, res) => {
  const property = await propertyService.updateListing(req.params.id, req.user._id, req.body);
  res.json({ message: "Updated and resubmitted for review", property });
};

export const updateAvailability = async (req, res) => {
  const property = await propertyService.updateAvailability(req.params.id, req.user._id, req.body);
  res.json({ message: "Availability updated", property });
};
