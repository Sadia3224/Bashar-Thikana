import { Router } from "express";
import protect from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";
import * as controller from "./booking.controller.js";

const router = Router();

router.post("/", protect, allowRoles("consumer"), controller.createBooking);
router.get("/mine", protect, allowRoles("consumer"), controller.getMyBookings);
router.patch("/:id/withdraw", protect, allowRoles("consumer"), controller.withdraw);
router.get("/owner/requests", protect, allowRoles("user"), controller.getOwnerRequests);
router.patch("/:id/status", protect, allowRoles("user"), controller.updateStatus);

export default router;
