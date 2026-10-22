const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { uploadPropertyImages } = require("../controllers/uploadController");

router.post(
  "/property-images",
  protect,
  allowRoles("user"),
  upload.array("images", 8),
  uploadPropertyImages
);

module.exports = router;
