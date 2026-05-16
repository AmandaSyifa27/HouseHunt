const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/landlordController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("landlord"));
router.get("/dashboard", getDashboard);

module.exports = router;
