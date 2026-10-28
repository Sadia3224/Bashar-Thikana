import { Router } from "express";
import protect, { optionalAuth } from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";
import { ROLES } from "../utils/constants.js";
import * as property from "./property.controller.js";

const router = Router();
const ownerOnly = [protect, allowRoles(ROLES.USER)];

router.get("/", property.getPublicProperties);
// "/mine" must come before "/:id" or it would be read as an id.
router.get("/mine", ownerOnly, property.getMyProperties);
router.get("/:id", optionalAuth, property.getPropertyById);
router.post("/", ownerOnly, property.createProperty);
router.put("/:id", ownerOnly, property.updateMyProperty);
router.patch("/:id/availability", ownerOnly, property.updateAvailability);

export default router;
