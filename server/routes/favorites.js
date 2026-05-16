const express = require("express");
const router = express.Router();
const {
 getFavorites,
 getFavoriteIds,
 addFavorite,
 removeFavorite,
} = require("../controllers/favoriteController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, authorize("tenant"), getFavorites);
router.get("/ids", protect, authorize("tenant"), getFavoriteIds);
router.post("/:propertyId", protect, authorize("tenant"), addFavorite);
router.delete("/:propertyId", protect, authorize("tenant"), removeFavorite);

module.exports = router;
