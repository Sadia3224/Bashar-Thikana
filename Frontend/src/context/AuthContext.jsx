import { createContext, useCallback, useContext, useMemo } from "react";
import { MOCK_USERS } from "../data/mockUsers";
import { uid, usePersistentState, wait } from "../utils/storage";

// Mock authentication for the frontend demo. Accounts live in this browser's localStorage and
// role checks only decide which screens are shown. This is not a secure authorization system.
const AuthContext = createContext(null);

async function hashPassword(userId, password) {
  const input = `bashar-thikana:${userId}:${password}`;
  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  // crypto.subtle is unavailable on non-HTTPS origins other than localhost.
  let hash = 5381;
  for (const char of input) hash = (hash * 33) ^ char.charCodeAt(0);
  return `djb2-${(hash >>> 0).toString(16)}`;
}

const normalizeEmail = (email) => email.trim().toLowerCase();

export function AuthProvider({ children }) {
  const [users, setUsers] = usePersistentState("users", MOCK_USERS);
  const [sessionId, setSessionId] = usePersistentState("session", null);

  const user = users.find((u) => u.id === sessionId && u.active) || null;

  const register = useCallback(
    async ({ name, email, phone, password, role }) => {
      await wait(700);
      const normalized = normalizeEmail(email);
      if (users.some((u) => u.email === normalized)) throw new Error("An account with this email already exists in this browser.");
      const id = uid("u");
      const newUser = {
        id,
        name: name.trim(),
        email: normalized,
        phone: phone.trim(),
        role,
        verified: false,
        active: true,
        about: "",
        createdAt: new Date().toISOString(),
        passwordHash: await hashPassword(id, password),
      };
      setUsers((prev) => [...prev, newUser]);
      setSessionId(newUser.id);
      return newUser;
    },
    [users, setUsers, setSessionId]
  );

  const login = useCallback(
    async (email, password) => {
      await wait(600);
      const normalized = normalizeEmail(email);
      const found = users.find((u) => u.email === normalized);
      if (!found || !found.passwordHash || found.passwordHash !== (await hashPassword(found.id, password))) {
        throw new Error("Incorrect email or password.");
      }
      if (!found.active) throw new Error("This account has been deactivated by an administrator.");
      setSessionId(found.id);
      return found;
    },
    [users, setSessionId]
  );

  const logout = useCallback(() => setSessionId(null), [setSessionId]);

  const updateProfile = useCallback(
    async (id, { name, email, phone, about, newPassword }) => {
      await wait(500);
      const normalized = normalizeEmail(email);
      if (users.some((u) => u.id !== id && u.email === normalized)) throw new Error("Another account already uses this email.");
      const passwordHash = newPassword ? await hashPassword(id, newPassword) : null;
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== id) return u;
          const next = { ...u, name: name.trim(), email: normalized, phone: phone.trim(), about: about.trim() };
          if (passwordHash) next.passwordHash = passwordHash;
          return next;
        })
      );
    },
    [users, setUsers]
  );

  const setUserActive = useCallback((id, active) => setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active } : u))), [setUsers]);
  const setUserVerified = useCallback((id, verified) => setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, verified } : u))), [setUsers]);

  const value = useMemo(
    () => ({ user, users, register, login, logout, updateProfile, setUserActive, setUserVerified }),
    [user, users, register, login, logout, updateProfile, setUserActive, setUserVerified]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
