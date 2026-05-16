const User = require("../models/User");
const Property = require("../models/Property");
const Transaction = require("../models/Transaction");

// GET /api/admin/stats
exports.getStats = async (req, res) => {
 try {
  const [
   totalUsers,
   totalLandlords,
   totalTenants,
   activeListings,
   bookedListings,
   hiddenListings,
   pendingTransactions,
   recentUsers,
   propertyTypeBreakdown,
   recentTransactions,
  ] = await Promise.all([
   User.countDocuments({ role: { $ne: "admin" } }),
   User.countDocuments({ role: "landlord" }),
   User.countDocuments({ role: "tenant" }),
   Property.countDocuments({ status: "available" }),
   Property.countDocuments({ status: "booked" }),
   Property.countDocuments({ status: "hidden" }),
   Transaction.countDocuments({
    status: "pending",
    transactionType: { $in: ["listing_fee", "subscription_premium"] },
   }),
   User.find({ role: { $ne: "admin" } })
    .select("name email role createdAt")
    .sort({ createdAt: -1 })
    .limit(5),
   Property.aggregate([
    { $match: { status: { $in: ["available", "booked"] } } },
    { $group: { _id: "$propertyType", count: { $sum: 1 } } },
   ]),
   Transaction.find({
    transactionType: { $in: ["listing_fee", "subscription_premium"] },
    status: "pending",
   })
    .populate("landlordId", "name email")
    .populate("propertyId", "title")
    .sort({ createdAt: -1 })
    .limit(5),
  ]);

  res.json({
   totalUsers,
   totalLandlords,
   totalTenants,
   activeListings,
   bookedListings,
   hiddenListings,
   pendingTransactions,
   recentUsers,
   propertyTypeBreakdown,
   recentTransactions,
  });
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// GET /api/admin/transactions
exports.getAllTransactions = async (req, res) => {
 try {
  const { status, type, page = 1, limit = 15 } = req.query;
  const filter = {
   transactionType: { $in: ["listing_fee", "subscription_premium"] },
  };
  if (status) filter.status = status;
  if (type) filter.transactionType = type;

  const skip = (Number(page) - 1) * Number(limit);
  const [transactions, total] = await Promise.all([
   Transaction.find(filter)
    .populate("landlordId", "name email")
    .populate("propertyId", "title")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit)),
   Transaction.countDocuments(filter),
  ]);

  res.json({
   transactions,
   total,
   pages: Math.ceil(total / Number(limit)),
   currentPage: Number(page),
  });
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// PUT /api/admin/transactions/:id — approve or reject landlord payment
exports.updateTransactionStatus = async (req, res) => {
 try {
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
   return res
    .status(400)
    .json({ message: "Status must be approved or rejected" });
  }

  const transaction = await Transaction.findById(req.params.id);
  if (!transaction)
   return res.status(404).json({ message: "Transaction not found" });

  transaction.status = status;
  await transaction.save();

  if (status === "approved") {
   if (
    transaction.transactionType === "listing_fee" &&
    transaction.propertyId
   ) {
    await Property.findByIdAndUpdate(transaction.propertyId, {
     status: "available",
    });
   }
   if (transaction.transactionType === "subscription_premium") {
    await User.findByIdAndUpdate(transaction.landlordId, {
     subscriptionStatus: "premium",
     recommendedPinsLeft: 3,
    });
   }
  }

  res.json(transaction);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// GET /api/admin/properties
exports.getAllProperties = async (req, res) => {
 try {
  const { status, page = 1, limit = 15 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [properties, total] = await Promise.all([
   Property.find(filter)
    .populate("landlordId", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit)),
   Property.countDocuments(filter),
  ]);

  res.json({
   properties,
   total,
   pages: Math.ceil(total / Number(limit)),
   currentPage: Number(page),
  });
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// PUT /api/admin/properties/:id — hide/unhide/delete
exports.updatePropertyStatus = async (req, res) => {
 try {
  const { status } = req.body;
  const property = await Property.findByIdAndUpdate(
   req.params.id,
   { status },
   { new: true },
  );
  if (!property) return res.status(404).json({ message: "Property not found" });
  res.json(property);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// DELETE /api/admin/properties/:id
exports.deleteProperty = async (req, res) => {
 try {
  const property = await Property.findByIdAndDelete(req.params.id);
  if (!property) return res.status(404).json({ message: "Property not found" });
  res.json({ message: "Property deleted" });
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
 try {
  const { role, status, page = 1, limit = 15 } = req.query;
  const filter = { role: { $ne: "admin" } };
  if (role) filter.role = role;
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
   User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit)),
   User.countDocuments(filter),
  ]);

  res.json({
   users,
   total,
   pages: Math.ceil(total / Number(limit)),
   currentPage: Number(page),
  });
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// PUT /api/admin/users/:id — ban/unban
exports.updateUserStatus = async (req, res) => {
 try {
  const { status } = req.body;
  if (!["active", "banned"].includes(status)) {
   return res.status(400).json({ message: "Status must be active or banned" });
  }
  const user = await User.findByIdAndUpdate(
   req.params.id,
   { status },
   { new: true },
  ).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};
