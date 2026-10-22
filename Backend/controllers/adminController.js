const Property = require("../models/Property");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Report = require("../models/Report");

exports.getDashboard = async (req, res, next) => {
  try {
    const [pendingProperties, ownerCount, consumerCount, openReports, bookingCount, approvedProperties] = await Promise.all([
      Property.countDocuments({ verificationStatus: "pending" }),
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "consumer" }),
      Report.countDocuments({ status: { $in: ["open", "reviewing"] } }),
      Booking.countDocuments(),
      Property.countDocuments({ verificationStatus: "approved" }),
    ]);
    res.json({ stats: { pendingProperties, ownerCount, consumerCount, openReports, bookingCount, approvedProperties } });
  } catch (error) { next(error); }
};

exports.getPendingProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ verificationStatus: { $in: ["pending", "changes-requested"] } })
      .populate("owner", "name email phone isVerified")
      .sort({ createdAt: 1 });
    res.json({ properties });
  } catch (error) { next(error); }
};

exports.reviewProperty = async (req, res, next) => {
  try {
    const allowed = ["approved", "rejected", "changes-requested"];
    if (!allowed.includes(req.body.decision)) return res.status(400).json({ message: "Invalid decision" });
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    property.verificationStatus = req.body.decision;
    property.isPublished = req.body.decision === "approved";
    property.rejectionReason = req.body.decision === "approved" ? "" : (req.body.reason || "");
    await property.save();
    res.json({ property });
  } catch (error) { next(error); }
};

exports.getUsers = async (req, res, next) => {
  try { res.json({ users: await User.find().select("-password").sort({ createdAt: -1 }) }); }
  catch (error) { next(error); }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(400).json({ message: "Admin status cannot be changed here" });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ user: { id: user._id, isActive: user.isActive } });
  } catch (error) { next(error); }
};

exports.getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate("reportedBy", "name email")
      .populate("property", "title address")
      .sort({ createdAt: -1 });
    res.json({ reports });
  } catch (error) { next(error); }
};

exports.updateReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    report.status = req.body.status;
    await report.save();
    res.json({ report });
  } catch (error) { next(error); }
};
