// Shared enums. `user` means property owner/manager; the UI labels it "Owner".
export const ROLES = Object.freeze({ CONSUMER: "consumer", USER: "user", ADMIN: "admin" });
export const ALL_ROLES = Object.values(ROLES);
export const SELF_REGISTER_ROLES = [ROLES.CONSUMER, ROLES.USER];

export const PROPERTY_TYPES = ["single-room", "shared-room", "bed", "full-flat"];
// Let out bed by bed, so they track total and available beds.
export const BED_BASED_TYPES = ["shared-room", "bed"];
export const GENDERS = ["male", "female", "any"];
export const WASHROOMS = ["attached", "shared"];
export const FURNISHINGS = ["furnished", "semi-furnished", "unfurnished"];
export const OCCUPANCY = ["available", "occupied"];
export const VERIFICATION_STATUSES = ["pending", "approved", "rejected", "changes-requested"];

export const MAX_PROPERTY_IMAGES = 8;
