import api from "./client";

// Listing fee per property type, e.g. { currency: "bdt", fees: { bed: 100, ... }, testMode: true }.
export const fetchListingFees = () => api.get("/payments/fees").then(({ data }) => data);

// Returns the Stripe Checkout URL to send the owner to.
export const startCheckout = (propertyId) => api.post("/payments/checkout", { propertyId }).then(({ data }) => data.url);

// After Stripe redirects back: the server checks the session with Stripe and returns the updated listing.
export const confirmCheckout = (sessionId) => api.post("/payments/confirm", { sessionId }).then(({ data }) => data.property);
