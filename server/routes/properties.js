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
} = require("../controllers/propertyController");
const { protect, authorize } = require("../middleware/auth");
const { uploadPropertyImages } = require("../middleware/upload");

router.get("/", getAll);
router.get(
 "/landlord/my",
 protect,
 authorize("landlord"),
 getLandlordProperties,
);
router.get("/:id", getById);
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
