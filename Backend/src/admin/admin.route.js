import { Router } from "express";
import protect from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";
import * as controller from "./admin.controller.js";

const router = Router();

router.use(protect, allowRoles("admin"));
router.get("/dashboard", controller.getDashboard);
router.get("/properties/pending", controller.getPendingProperties);
router.patch("/properties/:id/review", controller.reviewProperty);
router.get("/users", controller.getUsers);
router.patch("/users/:id/status", controller.toggleUserStatus);
router.get("/reports", controller.getReports);
router.patch("/reports/:id", controller.updateReport);

export default router;
