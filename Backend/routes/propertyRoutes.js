const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const controller = require("../controllers/propertyController");

router.get("/", controller.getPublicProperties);
router.get("/mine", protect, allowRoles("user"), controller.getMyProperties);
router.get("/:id", controller.getPropertyById);
router.post("/", protect, allowRoles("user"), controller.createProperty);
router.put("/:id", protect, allowRoles("user"), controller.updateMyProperty);
router.patch("/:id/availability", protect, allowRoles("user"), controller.updateAvailability);

module.exports = router;
