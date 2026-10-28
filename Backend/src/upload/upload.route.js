import { Router } from "express";
import protect from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";
import { propertyImages } from "../middleware/uploadMiddleware.js";
import { ROLES } from "../utils/constants.js";
import { uploadPropertyImages } from "./upload.controller.js";

const router = Router();

router.post("/property-images", protect, allowRoles(ROLES.USER), propertyImages, uploadPropertyImages);

export default router;
