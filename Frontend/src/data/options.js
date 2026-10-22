export const ROLES = {
  client: { label: "Client", home: "/client" },
  owner: { label: "Owner", home: "/owner" },
  admin: { label: "Admin", home: "/admin" },
};

export const PROPERTY_TYPES = [
  { value: "single-room", label: "Single Room", description: "A private room inside a shared flat or house." },
  { value: "shared-room", label: "Shared Room", description: "A room shared with one or more roommates." },
  { value: "bed", label: "Bed-wise Rental", description: "Rent a single bed in a mess, hostel or sublet." },
  { value: "full-flat", label: "Full Flat", description: "An entire apartment for families or groups." },
];

export const TYPE_LABELS = Object.fromEntries(PROPERTY_TYPES.map((t) => [t.value, t.label]));

// Types that are let out bed by bed and therefore track total/available beds.
export const BED_BASED_TYPES = ["shared-room", "bed"];

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "any", label: "Any Gender" },
];

export const GENDER_LABELS = { male: "Male only", female: "Female only", any: "Any gender" };

export const BED_OPTIONS = [
  { value: "1", label: "1 bed" },
  { value: "2", label: "2 beds" },
  { value: "3", label: "3 beds" },
  { value: "4", label: "4+ beds" },
];

export const FURNISHING_OPTIONS = [
  { value: "furnished", label: "Furnished" },
  { value: "semi-furnished", label: "Semi-furnished" },
  { value: "unfurnished", label: "Unfurnished" },
];

export const FURNISHING_LABELS = Object.fromEntries(FURNISHING_OPTIONS.map((f) => [f.value, f.label]));

export const WASHROOM_LABELS = { attached: "Attached washroom", shared: "Shared washroom" };

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Lowest price" },
  { value: "price-desc", label: "Highest price" },
];

export const FACILITIES = [
  "Wi-Fi",
  "Gas line",
  "Generator / IPS backup",
  "Lift",
  "Security guard",
  "CCTV",
  "Parking",
  "24/7 water supply",
  "Kitchen access",
  "Rooftop access",
  "Meal service",
  "Laundry",
  "Air conditioning",
  "Geyser",
  "Prayer space",
  "Near main road",
];

export const LISTING_STATUS_LABELS = { pending: "Pending review", approved: "Approved", rejected: "Rejected" };

export const REQUEST_STATUS_LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
  replied: "Replied",
};

export const REPORT_REASONS = [
  "Listing information is inaccurate",
  "Property is no longer available",
  "Suspected fake or duplicate listing",
  "Owner asked for advance payment outside the platform",
  "Inappropriate content",
  "Other",
];

export const VISIT_TIME_SLOTS = ["9:00 – 11:00 AM", "11:00 AM – 1:00 PM", "3:00 – 5:00 PM", "5:00 – 7:00 PM"];
