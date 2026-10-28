// The API stores roles as consumer / user / admin ("user" = property owner); the UI routes and labels use client / owner / admin.
const ROLE_FROM_API = { consumer: "client", user: "owner", admin: "admin" };
const ROLE_TO_API = { client: "consumer", owner: "user", admin: "admin" };

export const toApiRole = (role) => ROLE_TO_API[role] || role;

export const fromApiUser = (user) =>
  user && {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    about: user.about || "",
    role: ROLE_FROM_API[user.role] || user.role,
    verified: Boolean(user.isVerified),
    active: user.isActive !== false,
    createdAt: user.createdAt,
  };
