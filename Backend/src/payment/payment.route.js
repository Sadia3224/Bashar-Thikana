import express, { Router } from "express";
import protect from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";
import { ROLES } from "../utils/constants.js";
import * as payment from "./payment.controller.js";

const router = Router();
const ownerOnly = [protect, allowRoles(ROLES.USER)];

router.get("/fees", payment.getFees);
router.post("/checkout", ownerOnly, payment.createCheckout);
router.post("/confirm", ownerOnly, payment.confirmCheckout);

// Stripe signs the exact raw body, so this router is mounted before express.json() in server.js.
export const webhookRouter = Router();
webhookRouter.post("/", express.raw({ type: "application/json" }), payment.webhook);

export default router;
