const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const controller = require("../controllers/bookingController");

router.post("/", protect, allowRoles("consumer"), controller.createBooking);
router.get("/mine", protect, allowRoles("consumer"), controller.getMyBookings);
router.patch("/:id/withdraw", protect, allowRoles("consumer"), controller.withdraw);
router.get("/owner/requests", protect, allowRoles("user"), controller.getOwnerRequests);
router.patch("/:id/status", protect, allowRoles("user"), controller.updateStatus);

module.exports = router;
