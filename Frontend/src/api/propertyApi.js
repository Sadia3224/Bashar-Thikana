import api from "./client";

export const fetchPublicProperties = (params = {}) => api.get("/properties", { params }).then(({ data }) => data.properties);

export const fetchMyProperties = () => api.get("/properties/mine").then(({ data }) => data.properties);

export const fetchProperty = (id) => api.get(`/properties/${id}`).then(({ data }) => data.property);

export const createProperty = (property) => api.post("/properties", property).then(({ data }) => data.property);

export const updateProperty = (id, property) => api.put(`/properties/${id}`, property).then(({ data }) => data.property);

export const updateAvailability = (id, changes) => api.patch(`/properties/${id}/availability`, changes).then(({ data }) => data.property);

// Multipart field name must be "images"; returns the hosted URLs to store in property.images.
export function uploadPropertyImages(files) {
  const form = new FormData();
  files.forEach((file) => form.append("images", file));
  return api.post("/uploads/property-images", form).then(({ data }) => data.images.map((image) => image.url));
}

// Admin moderation (admin routes): listings waiting for review and the approve/reject decision.
export const fetchPendingProperties = () => api.get("/admin/properties/pending").then(({ data }) => data.properties);

export const reviewProperty = (id, decision, reason = "") =>
  api.patch(`/admin/properties/${id}/review`, { decision, reason }).then(({ data }) => data.property);
