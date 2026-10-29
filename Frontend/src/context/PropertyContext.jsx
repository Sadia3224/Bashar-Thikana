import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MOCK_REPORTS } from "../data/properties";
import * as propertyApi from "../api/propertyApi";
import * as paymentApi from "../api/paymentApi";
import { countActiveFilters, filtersToParams, isPublic } from "../utils/filters";
import { clearAll, uid, usePersistentState, wait } from "../utils/storage";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

// Listings come from the backend API. Favourites, requests, reports and recent searches are still
// kept in localStorage until their endpoints are connected.
const PropertyContext = createContext(null);

const GUEST = "guest";

// Later lists win, so an owner's or admin's copy replaces the public copy of the same listing.
const mergeById = (lists) => {
  const byId = new Map();
  lists.flat().forEach((p) => byId.set(p.id, { ...byId.get(p.id), ...p }));
  return [...byId.values()];
};

export function PropertyProvider({ children }) {
  const { user, users } = useAuth();
  const { notify } = useToast();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [requests, setRequests] = usePersistentState("requests", []);
  const [reports, setReports] = usePersistentState("reports", MOCK_REPORTS);
  const [favorites, setFavorites] = usePersistentState("favorites", {});
  const [searches, setSearches] = usePersistentState("searches", {});

  const role = user?.role;

  // Public listings for everyone, plus the owner's own listings or the admin review queue.
  const refreshProperties = useCallback(async () => {
    const loaders = [propertyApi.fetchPublicProperties()];
    if (role === "owner") loaders.push(propertyApi.fetchMyProperties());
    if (role === "admin") loaders.push(propertyApi.fetchPendingProperties());
    try {
      setProperties(mergeById(await Promise.all(loaders)));
      setLoadError("");
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    refreshProperties();
  }, [refreshProperties, user?.id]);

  const favoriteKey = user?.id || GUEST;
  const favoriteIds = useMemo(() => favorites[favoriteKey] || [], [favorites, favoriteKey]);

  // Favourites saved while signed out move into the account on sign-in.
  useEffect(() => {
    if (!user) return;
    setFavorites((prev) => {
      if (!prev[GUEST]?.length) return prev;
      const merged = Array.from(new Set([...(prev[user.id] || []), ...prev[GUEST]]));
      return { ...prev, [user.id]: merged, [GUEST]: [] };
    });
  }, [user, setFavorites]);

  const publicProperties = useMemo(() => properties.filter(isPublic), [properties]);

  const getProperty = useCallback((id) => properties.find((p) => p.id === id), [properties]);

  // Owners are known from the admin user list, the signed-in account, or the summary sent with each listing.
  const getUser = useCallback(
    (id) => users.find((u) => u.id === id) || (user?.id === id ? user : null) || properties.find((p) => p.owner?.id === id)?.owner,
    [users, user, properties]
  );

  const replaceProperty = useCallback((saved) => setProperties((prev) => prev.map((p) => (p.id === saved.id ? { ...p, ...saved } : p))), []);

  const patchProperty = useCallback(
    (id, patch) => setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
    []
  );

  const addProperty = useCallback(async (data) => {
    const property = await propertyApi.createProperty(data);
    setProperties((prev) => [property, ...prev]);
    return property;
  }, []);

  // The server sends an owner's edit back to the review queue and returns the updated listing.
  const updateProperty = useCallback(
    async (id, data) => {
      const property = await propertyApi.updateProperty(id, data);
      replaceProperty(property);
      return property;
    },
    [replaceProperty]
  );

  // Sends the owner to Stripe's hosted payment page for this listing's fee.
  const payListingFee = useCallback(async (id) => {
    window.location.assign(await paymentApi.startCheckout(id));
  }, []);

  // Called on the success page; the server double-checks the payment with Stripe.
  const confirmListingPayment = useCallback(
    async (sessionId) => {
      const property = await paymentApi.confirmCheckout(sessionId);
      if (property) replaceProperty(property);
      return property;
    },
    [replaceProperty]
  );

  // Applied on screen first, rolled back if the server refuses.
  const optimistic = useCallback(
    async (id, patch, request) => {
      const before = properties.find((p) => p.id === id);
      patchProperty(id, patch);
      try {
        return await request();
      } catch (error) {
        if (before) replaceProperty(before);
        notify(error.message, "error");
        return null;
      }
    },
    [properties, patchProperty, replaceProperty, notify]
  );

  const setOccupancy = useCallback(
    (id, occupancy) => optimistic(id, { occupancy }, () => propertyApi.updateAvailability(id, { occupancy })),
    [optimistic]
  );

  const reviewProperty = useCallback(
    (id, status, rejectionReason = "") =>
      optimistic(id, { status, rejectionReason, ...(status !== "approved" && { verified: false }) }, async () => {
        const saved = await propertyApi.reviewProperty(id, status, rejectionReason);
        // Only take the moderation fields back, so a verified badge set right after approval is kept.
        patchProperty(id, { status: saved.status, isPublished: saved.isPublished, rejectionReason: saved.rejectionReason });
        return saved;
      }),
    [optimistic, patchProperty]
  );

  // No delete or verify-listing endpoint yet: these change the list on screen until the admin API adds them.
  const setVerified = useCallback((id, verified) => patchProperty(id, { verified }), [patchProperty]);
  const deleteProperty = useCallback(
    (id) => {
      setProperties((prev) => prev.filter((p) => p.id !== id));
      setFavorites((prev) => Object.fromEntries(Object.entries(prev).map(([key, ids]) => [key, ids.filter((pid) => pid !== id)])));
    },
    [setFavorites]
  );

  const isFavorite = useCallback((id) => favoriteIds.includes(id), [favoriteIds]);
  const toggleFavorite = useCallback(
    (id) => {
      const saved = favoriteIds.includes(id);
      setFavorites((prev) => {
        const current = prev[favoriteKey] || [];
        return { ...prev, [favoriteKey]: saved ? current.filter((pid) => pid !== id) : [id, ...current] };
      });
      return !saved;
    },
    [favoriteIds, favoriteKey, setFavorites]
  );

  const createRequest = useCallback(
    async (data) => {
      await wait(800);
      const property = properties.find((p) => p.id === data.propertyId);
      const request = { ...data, id: uid("rq"), ownerId: property?.ownerId, status: "pending", createdAt: new Date().toISOString() };
      setRequests((prev) => [request, ...prev]);
      return request;
    },
    [properties, setRequests]
  );

  const updateRequestStatus = useCallback(
    (id, status) => setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r))),
    [setRequests]
  );

  const createReport = useCallback(
    async (data) => {
      await wait(700);
      const report = { ...data, id: uid("r"), status: "open", createdAt: new Date().toISOString() };
      setReports((prev) => [report, ...prev]);
      return report;
    },
    [setReports]
  );

  const updateReportStatus = useCallback(
    (id, status) => setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r))),
    [setReports]
  );

  const recentSearches = useMemo(() => (user ? searches[user.id] || [] : []), [searches, user]);

  const recordSearch = useCallback(
    (filters) => {
      if (user?.role !== "client" || countActiveFilters(filters) === 0) return;
      const query = filtersToParams({ ...filters, sort: "newest" }).toString();
      setSearches((prev) => {
        const current = (prev[user.id] || []).filter((s) => s.query !== query);
        return { ...prev, [user.id]: [{ id: uid("s"), query, createdAt: new Date().toISOString() }, ...current].slice(0, 10) };
      });
    },
    [user, setSearches]
  );

  const removeSearch = useCallback(
    (id) => user && setSearches((prev) => ({ ...prev, [user.id]: (prev[user.id] || []).filter((s) => s.id !== id) })),
    [user, setSearches]
  );
  const clearSearches = useCallback(() => user && setSearches((prev) => ({ ...prev, [user.id]: [] })), [user, setSearches]);

  const resetDemoData = useCallback(() => {
    clearAll();
    window.location.assign("/");
  }, []);

  const value = useMemo(
    () => ({
      properties,
      publicProperties,
      loading,
      loadError,
      requests,
      reports,
      favoriteIds,
      recentSearches,
      refreshProperties,
      getProperty,
      getUser,
      addProperty,
      updateProperty,
      payListingFee,
      confirmListingPayment,
      deleteProperty,
      setOccupancy,
      reviewProperty,
      setVerified,
      isFavorite,
      toggleFavorite,
      createRequest,
      updateRequestStatus,
      createReport,
      updateReportStatus,
      recordSearch,
      removeSearch,
      clearSearches,
      resetDemoData,
    }),
    [
      properties, publicProperties, loading, loadError, requests, reports, favoriteIds, recentSearches, refreshProperties, getProperty,
      getUser, addProperty, updateProperty, payListingFee, confirmListingPayment, deleteProperty, setOccupancy, reviewProperty, setVerified, isFavorite, toggleFavorite,
      createRequest, updateRequestStatus, createReport, updateReportStatus, recordSearch, removeSearch, clearSearches, resetDemoData,
    ]
  );

  return <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>;
}

export const useProperties = () => useContext(PropertyContext);
