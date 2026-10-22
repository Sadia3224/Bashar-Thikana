import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { MOCK_PROPERTIES, MOCK_REPORTS } from "../data/properties";
import { countActiveFilters, filtersToParams, isPublic } from "../utils/filters";
import { clearAll, uid, usePersistentState, wait } from "../utils/storage";
import { useAuth } from "./AuthContext";

// Local stand-in for a listings API: properties, favourites, requests, reports and recent searches,
// all persisted to localStorage. Nothing here reaches a server.
const PropertyContext = createContext(null);

const GUEST = "guest";

export function PropertyProvider({ children }) {
  const { user, users } = useAuth();
  const [properties, setProperties] = usePersistentState("properties", MOCK_PROPERTIES);
  const [requests, setRequests] = usePersistentState("requests", []);
  const [reports, setReports] = usePersistentState("reports", MOCK_REPORTS);
  const [favorites, setFavorites] = usePersistentState("favorites", {});
  const [searches, setSearches] = usePersistentState("searches", {});

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
  const getUser = useCallback((id) => users.find((u) => u.id === id), [users]);

  const addProperty = useCallback(
    async (data, ownerId) => {
      await wait(600);
      const property = {
        ...data,
        id: uid("p"),
        ownerId,
        status: "pending",
        verified: false,
        occupancy: "available",
        rejectionReason: "",
        createdAt: new Date().toISOString(),
      };
      setProperties((prev) => [property, ...prev]);
      return property;
    },
    [setProperties]
  );

  // An owner's edit sends the listing back to the review queue, mirroring how moderation would work.
  const updateProperty = useCallback(
    async (id, data) => {
      await wait(600);
      setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...data, status: "pending", verified: false, rejectionReason: "" } : p)));
    },
    [setProperties]
  );

  const patchProperty = useCallback(
    (id, patch) => setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
    [setProperties]
  );

  const deleteProperty = useCallback(
    (id) => {
      setProperties((prev) => prev.filter((p) => p.id !== id));
      setFavorites((prev) => Object.fromEntries(Object.entries(prev).map(([key, ids]) => [key, ids.filter((pid) => pid !== id)])));
    },
    [setProperties, setFavorites]
  );

  const setOccupancy = useCallback((id, occupancy) => patchProperty(id, { occupancy }), [patchProperty]);
  const reviewProperty = useCallback(
    (id, status, rejectionReason = "") => patchProperty(id, { status, rejectionReason, ...(status !== "approved" && { verified: false }) }),
    [patchProperty]
  );
  const setVerified = useCallback((id, verified) => patchProperty(id, { verified }), [patchProperty]);

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
      requests,
      reports,
      favoriteIds,
      recentSearches,
      getProperty,
      getUser,
      addProperty,
      updateProperty,
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
      properties, publicProperties, requests, reports, favoriteIds, recentSearches, getProperty, getUser, addProperty, updateProperty,
      deleteProperty, setOccupancy, reviewProperty, setVerified, isFavorite, toggleFavorite, createRequest, updateRequestStatus,
      createReport, updateReportStatus, recordSearch, removeSearch, clearSearches, resetDemoData,
    ]
  );

  return <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>;
}

export const useProperties = () => useContext(PropertyContext);
