import { Router } from "express";
import protect from "../middleware/authMiddleware.js";
import * as auth from "./auth.controller.js";

const router = Router();

router.post("/register", auth.register);
router.post("/login", auth.login);
router.get("/me", protect, auth.me);
router.put("/me", protect, auth.updateMe);

export default router;
