import Property from "../models/Property.js";
import ApiError from "../utils/ApiError.js";
import { assertObjectId, pick } from "../utils/validators.js";

const OWNER_SUMMARY = "name phone isVerified";
const MAX_RESULTS = 100;

const ownerInput = (body) => pick(body, Property.OWNER_FIELDS);

// Loads a listing the given owner is allowed to change, or throws 404 so other owners' ids are not revealed.
async function findOwned(id, ownerId) {
  assertObjectId(id, "Property");
  const property = await Property.findById(id);
  if (!property || !property.isOwnedBy(ownerId)) throw ApiError.notFound("Property not found");
  return property;
}

export async function searchPublic(params) {
  const filter = Property.buildSearchFilter(params);
  const limit = Math.min(Number(params.limit) || MAX_RESULTS, MAX_RESULTS);
  const query = Property.find(filter).populate("owner", OWNER_SUMMARY).limit(limit);
  // $near already orders by distance and cannot be combined with another sort.
  return filter.location ? query : query.sort(Property.sortFor(params.sort));
}

export async function getVisibleById(id, viewer) {
  assertObjectId(id, "Property");
  const property = await Property.findById(id).populate("owner", OWNER_SUMMARY);
  if (!property || !property.isVisibleTo(viewer)) throw ApiError.notFound("Property not found");
  return property;
}

export const listByOwner = (ownerId) => Property.find({ owner: ownerId }).sort({ createdAt: -1 });

export async function createListing(ownerId, body) {
  const property = new Property({ ...ownerInput(body), owner: ownerId, availabilityLastConfirmed: new Date() });
  property.resubmitForReview();
  return property.save();
}

export async function updateListing(id, ownerId, body) {
  const property = await findOwned(id, ownerId);
  property.set(ownerInput(body));
  property.resubmitForReview();
  return property.save();
}

export async function updateAvailability(id, ownerId, body) {
  const property = await findOwned(id, ownerId);
  property.applyAvailability(pick(body, ["occupancy", "availableBeds"]));
  return property.save();
}
