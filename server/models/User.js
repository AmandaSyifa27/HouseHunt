const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
 {
  name: { type: String, required: true, trim: true },
  email: {
   type: String,
   required: true,
   unique: true,
   lowercase: true,
   trim: true,
  },
  password: { type: String, required: true, minlength: 8 },
  contactNumber: { type: String, default: "" },
  profileImage: { type: String, default: "" },
  role: { type: String, enum: ["admin", "landlord", "tenant"], required: true },
  status: { type: String, enum: ["active", "banned"], default: "active" },
  // Landlord-specific fields
  subscriptionStatus: {
   type: String,
   enum: ["free", "premium"],
   default: "free",
  },
  freePostUsed: { type: Boolean, default: false },
  recommendedPinsLeft: { type: Number, default: 0 },
 },
 { timestamps: true },
);

userSchema.pre("save", async function (next) {
 if (!this.isModified("password")) return next();
 this.password = await bcrypt.hash(this.password, 12);
 next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
 return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
