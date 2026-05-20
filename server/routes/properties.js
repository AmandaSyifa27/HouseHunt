const express = require("express");
const router = express.Router();
const {
 getAll,
 getById,
 create,
 update,
 remove,
 toggleRecommended,
 getLandlordProperties,
 getPendingProperties,
 getCities,
} = require("../controllers/propertyController");
const { protect, authorize } = require("../middleware/auth");
const { uploadPropertyImages } = require("../middleware/upload");

// Public
router.get("/", getAll);
router.get("/cities", getCities);

// Landlord-specific — must be BEFORE /:id to avoid conflict
router.get(
 "/landlord/my",
 protect,
 authorize("landlord"),
 getLandlordProperties,
);
router.get(
 "/landlord/pending",
 protect,
 authorize("landlord"),
 getPendingProperties,
);

// Public detail — but passes req.user if token present (for pending_payment visibility)
router.get(
 "/:id",
 (req, res, next) => {
  const auth = require("../middleware/auth");
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
   const jwt = require("jsonwebtoken");
   try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const User = require("../models/User");
    User.findById(decoded.id)
     .select("-password")
     .then((user) => {
      req.user = user;
      next();
     })
     .catch(() => next());
   } catch {
    next();
   }
  } else {
   next();
  }
 },
 getById,
);

router.post("/", protect, authorize("landlord"), uploadPropertyImages, create);
router.put(
 "/:id",
 protect,
 authorize("landlord"),
 uploadPropertyImages,
 update,
);
router.delete("/:id", protect, authorize("landlord"), remove);
router.put(
 "/:id/recommended",
 protect,
 authorize("landlord"),
 toggleRecommended,
);

module.exports = router;
