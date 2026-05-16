const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
 {
  landlordId: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "User",
   required: true,
  },
  propertyType: {
   type: String,
   enum: ["House", "Apartment", "Villa"],
   required: true,
  },
  propertyAdType: { type: String, enum: ["Rent", "Sale"], required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  city: { type: String, required: true, trim: true },
  fullAddress: { type: String, required: true },
  gmapsLink: { type: String, default: "" },
  amenities: [{ type: String }],
  images: [{ type: String }],
  bedrooms: { type: Number, required: true, min: 0 },
  bathrooms: { type: Number, required: true, min: 0 },
  buildingArea: { type: Number, required: true },
  surfaceArea: { type: Number },
  floor: { type: Number, default: 1 },
  status: {
   type: String,
   enum: ["available", "booked", "hidden", "pending_payment"],
   default: "available",
  },
  isRecommended: { type: Boolean, default: false },
 },
 { timestamps: true },
);

propertySchema.index({ city: "text", title: "text" });

module.exports = mongoose.model("Property", propertySchema);
