const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const controller = require("../controllers/adminController");

router.use(protect, allowRoles("admin"));
router.get("/dashboard", controller.getDashboard);
router.get("/properties/pending", controller.getPendingProperties);
router.patch("/properties/:id/review", controller.reviewProperty);
router.get("/users", controller.getUsers);
router.patch("/users/:id/status", controller.toggleUserStatus);
router.get("/reports", controller.getReports);
router.patch("/reports/:id", controller.updateReport);

module.exports = router;
