import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/authApi";
import { getToken, setToken } from "../api/client";

// Accounts live in the backend. The JWT is kept in localStorage and sent by the Axios interceptor;
// the server enforces roles, while ProtectedRoute only decides which screens are shown.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True while a saved token is being checked, so protected pages don't bounce to /login on refresh.
  const [loading, setLoading] = useState(() => Boolean(getToken()));
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!getToken()) return;
    authApi
      .fetchMe()
      .then(setUser)
      .catch((error) => {
        if (error.status === 401 || error.status === 403) setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Only admins can list accounts; everyone else sees owners through the listings they load.
  useEffect(() => {
    if (user?.role !== "admin") {
      setUsers([]);
      return;
    }
    authApi.fetchUsers().then(setUsers).catch(() => setUsers([]));
  }, [user?.id, user?.role]);

  const startSession = useCallback(({ user: account, token }) => {
    setToken(token);
    setUser(account);
    return account;
  }, []);

  const register = useCallback((form) => authApi.register(form).then(startSession), [startSession]);

  const login = useCallback((email, password) => authApi.login(email.trim(), password).then(startSession), [startSession]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (_id, form) => {
    const updated = await authApi.updateMe(form);
    setUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    return updated;
  }, []);

  // The API toggles isActive, so only call it when the state actually needs to change.
  const setUserActive = useCallback(
    async (id, active) => {
      const target = users.find((u) => u.id === id);
      if (!target || target.active === active) return;
      const result = await authApi.toggleUserStatus(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: result.isActive } : u)));
    },
    [users]
  );

  // No owner-verification endpoint yet, so this only changes the list on screen until the admin API adds one.
  const setUserVerified = useCallback((id, verified) => setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, verified } : u))), []);

  const value = useMemo(
    () => ({ user, users, loading, register, login, logout, updateProfile, setUserActive, setUserVerified }),
    [user, users, loading, register, login, logout, updateProfile, setUserActive, setUserVerified]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
