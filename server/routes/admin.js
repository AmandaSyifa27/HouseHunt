const express = require("express");
const router = express.Router();
const {
 getStats,
 getAllTransactions,
 updateTransactionStatus,
 getAllProperties,
 updatePropertyStatus,
 deleteProperty,
 getAllUsers,
 updateUserStatus,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/transactions", getAllTransactions);
router.put("/transactions/:id", updateTransactionStatus);
router.get("/properties", getAllProperties);
router.put("/properties/:id", updatePropertyStatus);
router.delete("/properties/:id", deleteProperty);
router.get("/users", getAllUsers);
router.put("/users/:id", updateUserStatus);

module.exports = router;
