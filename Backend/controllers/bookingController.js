const Booking = require("../models/Booking");
const Property = require("../models/Property");

exports.createBooking = async (req, res, next) => {
  try {
    const property = await Property.findOne({
      _id: req.body.propertyId,
      isPublished: true,
      verificationStatus: "approved",
    });
    if (!property) return res.status(404).json({ message: "Property not available" });

    const booking = await Booking.create({
      consumer: req.user._id,
      property: property._id,
      roomId: req.body.roomId,
      moveInDate: req.body.moveInDate,
      message: req.body.message,
      requestType: req.body.requestType || "booking",
    });
    res.status(201).json({ message: "Request sent", booking });
  } catch (error) { next(error); }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ consumer: req.user._id })
      .populate("property", "title address monthlyRent images area")
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) { next(error); }
};

exports.getOwnerRequests = async (req, res, next) => {
  try {
    const ids = (await Property.find({ owner: req.user._id }).select("_id")).map((item) => item._id);
    const bookings = await Booking.find({ property: { $in: ids } })
      .populate("consumer", "name email phone")
      .populate("property", "title address images")
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) { next(error); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const allowed = ["under-review", "accepted", "temporary-hold", "confirmed", "rejected", "cancelled", "completed"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid status" });

    const booking = await Booking.findById(req.params.id).populate("property");
    if (!booking) return res.status(404).json({ message: "Request not found" });
    if (String(booking.property.owner) !== String(req.user._id)) return res.status(403).json({ message: "Not allowed" });

    booking.status = req.body.status;
    if (req.body.status === "temporary-hold") booking.holdExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await booking.save();
    res.json({ booking });
  } catch (error) { next(error); }
};

exports.withdraw = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, consumer: req.user._id });
    if (!booking) return res.status(404).json({ message: "Request not found" });
    if (!["requested", "under-review"].includes(booking.status)) {
      return res.status(400).json({ message: "This request can no longer be withdrawn" });
    }
    booking.status = "withdrawn";
    await booking.save();
    res.json({ booking });
  } catch (error) { next(error); }
};
