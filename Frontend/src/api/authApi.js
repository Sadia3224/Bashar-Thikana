import api from "./client";
import { fromApiUser, toApiRole } from "./adapters";

const session = ({ data }) => ({ user: fromApiUser(data.user), token: data.token });

export const register = ({ name, email, phone, password, role }) =>
  api.post("/auth/register", { name, email, phone, password, role: toApiRole(role) }).then(session);

export const login = (email, password) => api.post("/auth/login", { email, password }).then(session);

export const fetchMe = () => api.get("/auth/me").then(({ data }) => fromApiUser(data.user));

export const updateMe = ({ name, email, phone, about, newPassword }) =>
  api.put("/auth/me", { name, email, phone, about, newPassword: newPassword || undefined }).then(({ data }) => fromApiUser(data.user));

// Admin user management (admin routes).
export const fetchUsers = () => api.get("/admin/users").then(({ data }) => data.users.map(fromApiUser));

export const toggleUserStatus = (id) => api.patch(`/admin/users/${id}/status`).then(({ data }) => data.user);
