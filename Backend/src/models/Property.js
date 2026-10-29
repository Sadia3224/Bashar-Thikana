import mongoose from "mongoose";
import {
  BED_BASED_TYPES, FURNISHINGS, GENDERS, LISTING_FEE_CURRENCY, LISTING_FEES, MAX_PROPERTY_IMAGES, OCCUPANCY, PAYMENT_STATUSES,
  PROPERTY_TYPES, VERIFICATION_STATUSES, WASHROOMS,
} from "../utils/constants.js";
import { escapeRegex } from "../utils/validators.js";

// GeoJSON order is [longitude, latitude].
const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: {
      type: [Number],
      validate: {
        validator: ([lng, lat] = []) => Number.isFinite(lng) && Number.isFinite(lat) && Math.abs(lng) <= 180 && Math.abs(lat) <= 90,
        message: "location.coordinates must be [longitude, latitude]",
      },
    },
  },
  { _id: false }
);

// One-time listing fee paid through Stripe Checkout. Amount is in whole Taka.
const paymentSchema = new mongoose.Schema(
  {
    status: { type: String, enum: PAYMENT_STATUSES, default: "unpaid" },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: LISTING_FEE_CURRENCY },
    checkoutSessionId: { type: String, default: "" },
    paymentIntentId: { type: String, default: "" },
    paidAt: Date,
  },
  { _id: false }
);

const count = (label, min) => ({
  type: Number,
  min: [min, `${label} cannot be less than ${min}`],
  validate: { validator: Number.isInteger, message: `${label} must be a whole number` },
});

// Shape sent to the frontend: `id`, `ownerId`, `status`, a small `owner` summary when populated, and a plain date.
function toClient(doc, ret) {
  const owner = doc.populated("owner") ? doc.owner : null;
  ret.id = String(ret._id);
  ret.ownerId = String(owner?._id || ret.owner);
  ret.owner = owner ? { id: String(owner._id), name: owner.name, phone: owner.phone, verified: owner.isVerified } : undefined;
  ret.status = ret.verificationStatus;
  if (ret.availableFrom instanceof Date) ret.availableFrom = ret.availableFrom.toISOString().slice(0, 10);
  // Stripe ids stay on the server; clients only need to know whether the fee is paid.
  const payment = ret.payment || {};
  ret.payment = { status: payment.status || "unpaid", amount: payment.amount || 0, currency: payment.currency, paidAt: payment.paidAt };
  ret.listingFee = LISTING_FEES[ret.type];
  delete ret._id;
  delete ret.__v;
  return ret;
}

const propertySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: [true, "Title is required"], trim: true, minlength: [10, "Title must be at least 10 characters"], maxlength: 120 },
    description: { type: String, required: [true, "Description is required"], trim: true, minlength: [40, "Description must be at least 40 characters"] },
    district: { type: String, required: [true, "District is required"], trim: true },
    area: { type: String, required: [true, "Area is required"], trim: true },
    address: { type: String, required: [true, "Address is required"], trim: true },
    // Optional; when set it enables "near me" search through the 2dsphere index.
    location: { type: pointSchema, default: undefined },

    type: { type: String, enum: PROPERTY_TYPES, required: [true, "Property type is required"] },
    gender: { type: String, enum: GENDERS, required: [true, "Gender is required"] },
    rent: { type: Number, required: [true, "Rent is required"], min: [500, "Rent must be at least 500 Taka"] },
    rooms: { ...count("Rooms", 1), default: 1 },
    bathrooms: { ...count("Bathrooms", 1), default: 1 },
    totalBeds: { ...count("Total beds", 1), default: 1 },
    availableBeds: { ...count("Available beds", 0), default: 1 },
    washroom: { type: String, enum: WASHROOMS, required: [true, "Washroom type is required"] },
    balcony: { type: Boolean, default: false },
    furnishing: { type: String, enum: FURNISHINGS, required: [true, "Furnishing is required"] },
    availableFrom: { type: Date, required: [true, "Available-from date is required"] },
    facilities: { type: [String], default: [] },
    images: {
      type: [String],
      validate: [
        { validator: (list) => list.length > 0, message: "Add at least one image" },
        { validator: (list) => list.length <= MAX_PROPERTY_IMAGES, message: `Up to ${MAX_PROPERTY_IMAGES} images are allowed` },
      ],
    },

    occupancy: { type: String, enum: OCCUPANCY, default: "available" },
    availabilityLastConfirmed: { type: Date, default: Date.now },

    // Moderation. Only admins change these; an owner's edit resets them to pending.
    verificationStatus: { type: String, enum: VERIFICATION_STATUSES, default: "pending" },
    isPublished: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    rejectionReason: { type: String, default: "" },
    payment: { type: paymentSchema, default: () => ({}) },
  },
  { timestamps: true, toJSON: { versionKey: false, transform: toClient } }
);

propertySchema.index({ location: "2dsphere" });
propertySchema.index({ verificationStatus: 1, isPublished: 1, createdAt: -1 });

propertySchema.pre("validate", function checkBeds() {
  if (this.availableBeds > this.totalBeds) this.invalidate("availableBeds", "Available beds cannot exceed total beds");
});

// Fields an owner may send on create/update. Everything else (owner, moderation) is set by the server.
propertySchema.statics.OWNER_FIELDS = [
  "title", "description", "district", "area", "address", "location", "type", "gender", "rent", "rooms", "bathrooms",
  "totalBeds", "availableBeds", "washroom", "balcony", "furnishing", "availableFrom", "facilities", "images",
];

propertySchema.statics.PUBLIC_FILTER = Object.freeze({ isPublished: true, verificationStatus: "approved" });

// The admin review queue only holds listings whose fee is paid.
propertySchema.statics.REVIEW_QUEUE_FILTER = Object.freeze({
  verificationStatus: { $in: ["pending", "changes-requested"] },
  "payment.status": "paid",
});

propertySchema.statics.listingFeeFor = (type) => LISTING_FEES[type];

const SORTS = {
  newest: { createdAt: -1 },
  "price-asc": { rent: 1, createdAt: -1 },
  "price-desc": { rent: -1, createdAt: -1 },
};
propertySchema.statics.sortFor = (sort) => SORTS[sort] || SORTS.newest;

const hasValue = (value) => value !== undefined && value !== null && value !== "";

/**
 * Turn search query params into a MongoDB filter over public listings.
 * Accepts the frontend's filter names (q, district, area, type, gender, minRent, maxRent, beds, balcony,
 * washroom, furnishing, availableBy, verified) plus availableNow and lng/lat/radius (km).
 */
propertySchema.statics.buildSearchFilter = function buildSearchFilter(params = {}) {
  const filter = { ...this.PUBLIC_FILTER };
  const and = [];

  if (hasValue(params.q) && String(params.q).trim()) {
    const re = new RegExp(escapeRegex(String(params.q).trim()), "i");
    and.push({ $or: [{ title: re }, { area: re }, { district: re }, { address: re }] });
  }
  if (hasValue(params.district)) filter.district = String(params.district);
  if (hasValue(params.area)) filter.area = new RegExp(`^${escapeRegex(params.area)}$`, "i");

  // "shared" is the home page's combined "Shared Room or Bed" choice.
  if (params.type === "shared") filter.type = { $in: BED_BASED_TYPES };
  else if (hasValue(params.type)) filter.type = String(params.type);

  // A female searcher can rent female-only or any-gender listings; "any" alone means open to everyone.
  if (params.gender === "any") filter.gender = "any";
  else if (hasValue(params.gender)) filter.gender = { $in: [String(params.gender), "any"] };

  if (hasValue(params.minRent) && Number.isFinite(Number(params.minRent))) filter.rent = { ...filter.rent, $gte: Number(params.minRent) };
  if (hasValue(params.maxRent) && Number.isFinite(Number(params.maxRent))) filter.rent = { ...filter.rent, $lte: Number(params.maxRent) };

  // "Beds" means bedrooms for flats, free beds for bed-based rentals and beds in the room for single rooms.
  const beds = Number(params.beds);
  if (Number.isInteger(beds) && beds > 0) {
    and.push({
      $or: [
        { type: "full-flat", rooms: { $gte: beds } },
        { type: { $in: BED_BASED_TYPES }, availableBeds: { $gte: beds } },
        { type: "single-room", totalBeds: { $gte: beds } },
      ],
    });
  }

  if (params.balcony === "yes") filter.balcony = true;
  if (params.balcony === "no") filter.balcony = false;
  if (hasValue(params.washroom)) filter.washroom = String(params.washroom);
  if (hasValue(params.furnishing)) filter.furnishing = String(params.furnishing);
  if (String(params.verified) === "true") filter.verified = true;

  const availableBy = hasValue(params.availableBy) ? new Date(params.availableBy) : null;
  if (availableBy && !Number.isNaN(availableBy.getTime())) filter.availableFrom = { $lte: availableBy };

  if (String(params.availableNow) === "true") {
    filter.occupancy = "available";
    and.push({ $or: [{ type: { $nin: BED_BASED_TYPES } }, { availableBeds: { $gt: 0 } }] });
  }

  const lng = Number(params.lng);
  const lat = Number(params.lat);
  if (hasValue(params.lng) && hasValue(params.lat) && Number.isFinite(lng) && Number.isFinite(lat)) {
    const radiusKm = Number(params.radius) > 0 ? Number(params.radius) : 5;
    filter.location = { $near: { $geometry: { type: "Point", coordinates: [lng, lat] }, $maxDistance: radiusKm * 1000 } };
  }

  if (and.length) filter.$and = and;
  return filter;
};

propertySchema.methods.isOwnedBy = function isOwnedBy(userId) {
  return String(this.owner?._id || this.owner) === String(userId);
};

propertySchema.methods.isPublic = function isPublic() {
  return this.isPublished && this.verificationStatus === "approved";
};

// Anyone may see a public listing; pending or rejected ones only their owner or an admin.
propertySchema.methods.isVisibleTo = function isVisibleTo(user) {
  return this.isPublic() || Boolean(user && (user.role === "admin" || this.isOwnedBy(user._id)));
};

// Any content change by the owner sends the listing back to the admin review queue.
propertySchema.methods.resubmitForReview = function resubmitForReview() {
  this.verificationStatus = "pending";
  this.isPublished = false;
  this.verified = false;
  this.rejectionReason = "";
};

propertySchema.methods.applyAvailability = function applyAvailability({ occupancy, availableBeds } = {}) {
  if (occupancy !== undefined) this.occupancy = occupancy;
  if (availableBeds !== undefined) this.availableBeds = Number(availableBeds);
  this.availabilityLastConfirmed = new Date();
};

propertySchema.methods.listingFee = function listingFee() {
  return LISTING_FEES[this.type];
};

propertySchema.methods.isPaid = function isPaid() {
  return this.payment?.status === "paid";
};

// The fee depends on the type, so a paid listing cannot switch to a different (possibly pricier) type.
propertySchema.pre("validate", function lockPaidType() {
  if (!this.isNew && this.isModified("type") && this.isPaid()) {
    this.invalidate("type", "Property type cannot be changed after the listing fee is paid");
  }
});

// Safe to call twice (redirect and webhook can both confirm the same payment).
propertySchema.methods.markPaid = function markPaid({ checkoutSessionId, paymentIntentId, amount }) {
  if (this.isPaid()) return false;
  this.payment = {
    status: "paid",
    amount,
    currency: LISTING_FEE_CURRENCY,
    checkoutSessionId,
    paymentIntentId: paymentIntentId || "",
    paidAt: new Date(),
  };
  return true;
};

export default mongoose.model("Property", propertySchema);
