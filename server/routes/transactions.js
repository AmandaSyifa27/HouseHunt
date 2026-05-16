const express = require("express");
const router = express.Router();
const {
 createLandlordTransaction,
 createBookingTransaction,
 getLandlordBilling,
 getLandlordOrders,
 respondToOrder,
 getTenantBookings,
 uploadBillingProof,
} = require("../controllers/transactionController");
const { protect, authorize } = require("../middleware/auth");
const { uploadProof } = require("../middleware/upload");

// Landlord
router.post(
 "/",
 protect,
 authorize("landlord"),
 uploadProof,
 createLandlordTransaction,
);
router.get(
 "/landlord/billing",
 protect,
 authorize("landlord"),
 getLandlordBilling,
);
router.get(
 "/landlord/orders",
 protect,
 authorize("landlord"),
 getLandlordOrders,
);
router.put(
 "/landlord/orders/:id",
 protect,
 authorize("landlord"),
 respondToOrder,
);
router.put(
 "/landlord/billing/:id/proof",
 protect,
 authorize("landlord"),
 uploadProof,
 uploadBillingProof,
);

// Tenant
router.post(
 "/booking/:propertyId",
 protect,
 authorize("tenant"),
 uploadProof,
 createBookingTransaction,
);
router.get("/tenant/bookings", protect, authorize("tenant"), getTenantBookings);

module.exports = router;
