import Property from "../models/Property.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Report from "../models/Report.js";
import ApiError from "../utils/ApiError.js";

const REVIEW_DECISIONS = ["approved", "rejected", "changes-requested"];

export async function getDashboardStats() {
  const [pendingProperties, ownerCount, consumerCount, openReports, bookingCount, approvedProperties] = await Promise.all([
    Property.countDocuments({ ...Property.REVIEW_QUEUE_FILTER, verificationStatus: "pending" }),
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "consumer" }),
    Report.countDocuments({ status: { $in: ["open", "reviewing"] } }),
    Booking.countDocuments(),
    Property.countDocuments({ verificationStatus: "approved" }),
  ]);
  return { pendingProperties, ownerCount, consumerCount, openReports, bookingCount, approvedProperties };
}

export const listPendingProperties = () =>
  Property.find(Property.REVIEW_QUEUE_FILTER)
    .populate("owner", "name email phone isVerified")
    .sort({ createdAt: 1 });

export async function reviewProperty(id, { decision, reason } = {}) {
  if (!REVIEW_DECISIONS.includes(decision)) throw ApiError.badRequest("Invalid decision");
  const property = await Property.findById(id);
  if (!property) throw ApiError.notFound("Property not found");
  if (decision === "approved" && !property.isPaid()) throw ApiError.badRequest("The listing fee for this property has not been paid");

  property.verificationStatus = decision;
  property.isPublished = decision === "approved";
  property.rejectionReason = decision === "approved" ? "" : (reason || "");
  return property.save();
}

export const listUsers = () => User.find().select("-password").sort({ createdAt: -1 });

export async function toggleUserStatus(id) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound("User not found");
  if (user.role === "admin") throw ApiError.badRequest("Admin status cannot be changed here");
  user.isActive = !user.isActive;
  await user.save();
  return { id: user._id, isActive: user.isActive };
}

export const listReports = () =>
  Report.find()
    .populate("reportedBy", "name email")
    .populate("property", "title address")
    .sort({ createdAt: -1 });

export async function updateReportStatus(id, status) {
  const report = await Report.findById(id);
  if (!report) throw ApiError.notFound("Report not found");
  report.status = status;
  return report.save();
}
