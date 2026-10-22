import { BED_BASED_TYPES } from "../data/options";

export const formatBDT = (amount) => `৳${Number(amount || 0).toLocaleString("en-IN")}`;

const toDate = (value) => (typeof value === "string" && value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value));

export function formatDate(value) {
  if (!value) return "Not set";
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function availabilityText(property) {
  if (property.occupancy === "occupied") return "Currently occupied";
  if (!property.availableFrom || property.availableFrom <= todayISO()) return "Available now";
  return `From ${formatDate(property.availableFrom)}`;
}

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

// Full flats are described by bedrooms/bathrooms; bed-based rentals by free beds.
export function capacityText(property) {
  if (property.type === "full-flat") return `${plural(property.rooms, "bedroom")} · ${plural(property.bathrooms, "bath")}`;
  if (BED_BASED_TYPES.includes(property.type)) return `${property.availableBeds} of ${plural(property.totalBeds, "bed")} free`;
  return `${plural(property.totalBeds, "bed")} in room`;
}

export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
