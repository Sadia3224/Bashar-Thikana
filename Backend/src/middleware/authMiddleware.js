import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { verifyToken } from "../utils/generateToken.js";

const bearerToken = (req) => {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : null;
};

async function userFromToken(token) {
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }
  const user = await User.findById(decoded.id);
  if (!user) throw ApiError.unauthorized("User no longer exists");
  if (!user.isActive) throw ApiError.forbidden("This account has been deactivated by an administrator");
  return user;
}

// Requires a valid `Authorization: Bearer <token>` and sets req.user.
export default async function protect(req, res, next) {
  const token = bearerToken(req);
  if (!token) throw ApiError.unauthorized();
  req.user = await userFromToken(token);
  next();
}

// Sets req.user when a valid token is sent, but lets anonymous requests through (e.g. public details pages).
export async function optionalAuth(req, res, next) {
  const token = bearerToken(req);
  if (token) {
    try {
      req.user = await userFromToken(token);
    } catch {
      req.user = undefined;
    }
  }
  next();
}
