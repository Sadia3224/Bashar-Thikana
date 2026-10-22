import { BED_BASED_TYPES, BED_OPTIONS, FURNISHING_LABELS, GENDER_OPTIONS, TYPE_LABELS } from "../data/options";
import { isAreaInDistrict } from "../data/locations";
import { formatBDT, formatDate } from "./format";

export const DEFAULT_FILTERS = {
  q: "",
  district: "",
  area: "",
  type: "",
  gender: "",
  minRent: "",
  maxRent: "",
  beds: "",
  balcony: "",
  washroom: "",
  furnishing: "",
  availableBy: "",
  verified: false,
  sort: "newest",
};

// Filters live in the URL so searches survive refreshes and can be shared or re-run.
export function filtersFromParams(params) {
  const filters = { ...DEFAULT_FILTERS };
  for (const key of Object.keys(DEFAULT_FILTERS)) {
    const value = params.get(key);
    if (value === null) continue;
    filters[key] = key === "verified" ? value === "true" : value;
  }
  if (filters.area && !isAreaInDistrict(filters.district, filters.area)) filters.area = "";
  return filters;
}

export function filtersToParams(filters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === DEFAULT_FILTERS[key] || value === "" || value === false) continue;
    params.set(key, String(value));
  }
  return params;
}

export const filtersToQuery = (filters) => {
  const query = filtersToParams(filters).toString();
  return query ? `?${query}` : "";
};

export const hasRentError = (filters) =>
  filters.minRent !== "" && filters.maxRent !== "" && Number(filters.minRent) > Number(filters.maxRent);

// "shared" is the home page's combined "Shared Room / Bed" choice.
export const TYPE_FILTER_LABELS = { ...TYPE_LABELS, shared: "Shared Room or Bed" };

function matchesType(property, type) {
  return type === "shared" ? BED_BASED_TYPES.includes(property.type) : property.type === type;
}

// Occupant gender: a female searcher can rent female-only or any-gender listings.
// "any" on its own means listings that are explicitly open to everyone.
function matchesGender(property, gender) {
  if (!gender) return true;
  if (gender === "any") return property.gender === "any";
  return property.gender === gender || property.gender === "any";
}

// "Beds" means free beds for bed-based rentals, beds in the room for single rooms, bedrooms for flats.
export function bedCapacity(property) {
  if (property.type === "full-flat") return property.rooms;
  if (BED_BASED_TYPES.includes(property.type)) return property.availableBeds;
  return property.totalBeds;
}

export function matchesFilters(property, filters) {
  const q = filters.q.trim().toLowerCase();
  if (q && ![property.title, property.area, property.district, property.address].some((text) => text?.toLowerCase().includes(q))) return false;
  if (filters.district && property.district !== filters.district) return false;
  if (filters.area && property.area !== filters.area) return false;
  if (filters.type && !matchesType(property, filters.type)) return false;
  if (!matchesGender(property, filters.gender)) return false;
  if (filters.minRent !== "" && property.rent < Number(filters.minRent)) return false;
  if (filters.maxRent !== "" && property.rent > Number(filters.maxRent)) return false;
  if (filters.beds && bedCapacity(property) < Number(filters.beds)) return false;
  if (filters.balcony === "yes" && !property.balcony) return false;
  if (filters.balcony === "no" && property.balcony) return false;
  if (filters.washroom && property.washroom !== filters.washroom) return false;
  if (filters.furnishing && property.furnishing !== filters.furnishing) return false;
  if (filters.availableBy && property.availableFrom > filters.availableBy) return false;
  if (filters.verified && !property.verified) return false;
  return true;
}

const SORTERS = {
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  "price-asc": (a, b) => a.rent - b.rent,
  "price-desc": (a, b) => b.rent - a.rent,
};

export function applyFilters(properties, filters) {
  return properties.filter((property) => matchesFilters(property, filters)).sort(SORTERS[filters.sort] || SORTERS.newest);
}

export const isPublic = (property) => property.status === "approved";

export function countActiveFilters(filters) {
  return Object.keys(DEFAULT_FILTERS).filter((key) => key !== "sort" && filters[key] !== DEFAULT_FILTERS[key]).length;
}

const labelFrom = (options, value) => options.find((option) => option.value === value)?.label || value;

// Human-readable chips for the active filters; `key` tells the caller which field(s) to reset.
export function describeFilters(filters) {
  const chips = [];
  if (filters.q) chips.push({ key: "q", label: `“${filters.q}”` });
  if (filters.district) chips.push({ key: "district", label: filters.district });
  if (filters.area) chips.push({ key: "area", label: filters.area });
  if (filters.type) chips.push({ key: "type", label: TYPE_FILTER_LABELS[filters.type] });
  if (filters.gender) chips.push({ key: "gender", label: `For ${labelFrom(GENDER_OPTIONS, filters.gender).toLowerCase()}` });
  if (filters.minRent) chips.push({ key: "minRent", label: `Min ${formatBDT(filters.minRent)}` });
  if (filters.maxRent) chips.push({ key: "maxRent", label: `Max ${formatBDT(filters.maxRent)}` });
  if (filters.beds) chips.push({ key: "beds", label: labelFrom(BED_OPTIONS, filters.beds) });
  if (filters.balcony) chips.push({ key: "balcony", label: filters.balcony === "yes" ? "With balcony" : "No balcony" });
  if (filters.washroom) chips.push({ key: "washroom", label: filters.washroom === "attached" ? "Attached washroom" : "Shared washroom" });
  if (filters.furnishing) chips.push({ key: "furnishing", label: FURNISHING_LABELS[filters.furnishing] });
  if (filters.availableBy) chips.push({ key: "availableBy", label: `Available by ${formatDate(filters.availableBy)}` });
  if (filters.verified) chips.push({ key: "verified", label: "Verified only" });
  return chips;
}
