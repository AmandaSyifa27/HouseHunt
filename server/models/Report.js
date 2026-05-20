const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
 {
  tenantId: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "User",
   required: true,
  },
  landlordId: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "User",
   required: true,
  },
  propertyId: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "Property",
   required: true,
  },
  reason: {
   type: String,
   enum: [
    "fraud",
    "inappropriate_content",
    "wrong_information",
    "scam",
    "other",
   ],
   required: true,
  },
  description: { type: String, default: "" },
  status: {
   type: String,
   enum: ["pending", "reviewed", "dismissed"],
   default: "pending",
  },
 },
 { timestamps: true },
);

// One tenant can only report the same property once
reportSchema.index({ tenantId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model("Report", reportSchema);
