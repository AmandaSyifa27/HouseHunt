const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
 {
  landlordId: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "User",
   required: true,
  },
  tenantId: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "User",
   default: null,
  },
  transactionType: {
   type: String,
   enum: ["subscription_premium", "listing_fee", "property_booking"],
   required: true,
  },
  propertyId: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "Property",
   default: null,
  },
  amount: { type: Number, required: true },
  proofOfPaymentImage: { type: String, default: "" },
  status: {
   type: String,
   enum: ["pending", "approved", "rejected"],
   default: "pending",
  },
  notes: { type: String, default: "" },
 },
 { timestamps: true },
);

module.exports = mongoose.model("Transaction", transactionSchema);
