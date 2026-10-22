const Property = require("../models/Property");

exports.createProperty = async (req, res, next) => {
  try {
    const property = await Property.create({
      ...req.body,
      owner: req.user._id,
      verificationStatus: "pending",
      isPublished: false,
      availabilityLastConfirmed: new Date(),
    });
    res.status(201).json({ message: "Property submitted for review", property });
  } catch (error) { next(error); }
};

exports.getPublicProperties = async (req, res, next) => {
  try {
    const {
      propertyType,
      minRent,
      maxRent,
      suitableFor,
      area,
      lng,
      lat,
      radius = 5,
      availableNow,
    } = req.query;

    const query = { isPublished: true, verificationStatus: "approved" };
    if (propertyType) query.propertyType = propertyType;
    if (suitableFor) query.suitableFor = suitableFor;
    if (area) query.$or = [
      { area: { $regex: area, $options: "i" } },
      { address: { $regex: area, $options: "i" } },
      { city: { $regex: area, $options: "i" } },
    ];
    if (availableNow === "true") query.availableUnits = { $gt: 0 };
    if (minRent || maxRent) {
      query.monthlyRent = {};
      if (minRent) query.monthlyRent.$gte = Number(minRent);
      if (maxRent) query.monthlyRent.$lte = Number(maxRent);
    }
    if (lng && lat) {
      query.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radius) * 1000,
        },
      };
    }

    const properties = await Property.find(query)
      .populate("owner", "name phone isVerified")
      .sort({ availabilityLastConfirmed: -1, createdAt: -1 })
      .limit(100);

    res.json({ properties });
  } catch (error) { next(error); }
};

exports.getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate("owner", "name phone isVerified");
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json({ property });
  } catch (error) { next(error); }
};

exports.getMyProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ properties });
  } catch (error) { next(error); }
};

exports.updateMyProperty = async (req, res, next) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, owner: req.user._id });
    if (!property) return res.status(404).json({ message: "Property not found" });

    const body = { ...req.body };
    delete body.owner;
    delete body.verificationStatus;
    delete body.isPublished;

    Object.assign(property, body);
    property.verificationStatus = "pending";
    property.isPublished = false;
    await property.save();
    res.json({ message: "Updated and resubmitted for review", property });
  } catch (error) { next(error); }
};

exports.updateAvailability = async (req, res, next) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, owner: req.user._id });
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (Number.isFinite(Number(req.body.availableUnits))) property.availableUnits = Number(req.body.availableUnits);
    if (Array.isArray(req.body.rooms)) property.rooms = req.body.rooms;
    property.availabilityLastConfirmed = new Date();
    await property.save();

    res.json({ message: "Availability updated", property });
  } catch (error) { next(error); }
};
