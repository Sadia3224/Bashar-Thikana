import mongoose from "mongoose";
import ApiError from "./ApiError.js";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Bangladeshi mobile numbers: 01XXXXXXXXX, optionally prefixed with +88 / 88; spaces and dashes allowed.
const PHONE_RE = /^(?:\+?88)?01[3-9]\d{8}$/;

export const isValidEmail = (email) => EMAIL_RE.test(String(email || "").trim());
export const isValidPhone = (phone) => PHONE_RE.test(String(phone || "").replace(/[\s-]/g, ""));
export const isObjectId = (id) => mongoose.isValidObjectId(id);

// Same rule as the frontend's passwordProblem(), so both sides reject the same passwords.
export function passwordProblem(password) {
  if (typeof password !== "string" || password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Password must include at least one letter and one number";
  return "";
}

// Throws 400 listing every missing field, e.g. "name, email are required".
export function requireFields(body, fields) {
  const missing = fields.filter((field) => body?.[field] === undefined || body[field] === null || String(body[field]).trim() === "");
  if (missing.length) throw ApiError.badRequest(`${missing.join(", ")} ${missing.length > 1 ? "are" : "is"} required`);
}

export function assertObjectId(id, label = "Resource") {
  if (!isObjectId(id)) throw ApiError.notFound(`${label} not found`);
}

// Copy only whitelisted keys that are present, so clients cannot set protected fields.
export const pick = (source = {}, keys = []) =>
  Object.fromEntries(keys.filter((key) => source[key] !== undefined).map((key) => [key, source[key]]));

export const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
