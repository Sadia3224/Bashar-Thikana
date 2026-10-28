import { Router } from "express";
import protect from "../middleware/authMiddleware.js";
import { parseAccommodationQuery } from "./ai.controller.js";

const router = Router();

router.post("/search", protect, parseAccommodationQuery);

export default router;
