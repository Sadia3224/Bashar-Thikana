import jwt from "jsonwebtoken";
import env from "../config/env.js";

// Token format shared with the frontend: `Authorization: Bearer <jwt>`, payload `{ id, role }`.
export const generateToken = (user) => jwt.sign({ id: String(user._id), role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

export default generateToken;
