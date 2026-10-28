import Booking from "../models/Booking.js";
import Property from "../models/Property.js";
import ApiError from "../utils/ApiError.js";

const OWNER_STATUSES = ["under-review", "accepted", "temporary-hold", "confirmed", "rejected", "cancelled", "completed"];
const WITHDRAWABLE = ["requested", "under-review"];
const HOLD_MINUTES = 30;

export async function createBooking(consumerId, body) {
  const property = await Property.findOne({ _id: body.propertyId, ...Property.PUBLIC_FILTER });
  if (!property) throw ApiError.notFound("Property not available");

  return Booking.create({
    consumer: consumerId,
    property: property._id,
    roomId: body.roomId,
    moveInDate: body.moveInDate,
    message: body.message,
    requestType: body.requestType || "booking",
  });
}

export const listByConsumer = (consumerId) =>
  Booking.find({ consumer: consumerId })
    .populate("property", "title address rent images area district")
    .sort({ createdAt: -1 });

export async function listForOwner(ownerId) {
  const ids = (await Property.find({ owner: ownerId }).select("_id")).map((item) => item._id);
  return Booking.find({ property: { $in: ids } })
    .populate("consumer", "name email phone")
    .populate("property", "title address images")
    .sort({ createdAt: -1 });
}

export async function updateStatus(id, ownerId, status) {
  if (!OWNER_STATUSES.includes(status)) throw ApiError.badRequest("Invalid status");

  const booking = await Booking.findById(id).populate("property");
  if (!booking) throw ApiError.notFound("Request not found");
  if (String(booking.property.owner) !== String(ownerId)) throw ApiError.forbidden("Not allowed");

  booking.status = status;
  if (status === "temporary-hold") booking.holdExpiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);
  return booking.save();
}

export async function withdraw(id, consumerId) {
  const booking = await Booking.findOne({ _id: id, consumer: consumerId });
  if (!booking) throw ApiError.notFound("Request not found");
  if (!WITHDRAWABLE.includes(booking.status)) throw ApiError.badRequest("This request can no longer be withdrawn");
  booking.status = "withdrawn";
  return booking.save();
}
