const Transaction = require("../models/Transaction");
const Property = require("../models/Property");
const User = require("../models/User");

// POST /api/transactions — create a transaction (listing_fee or subscription_premium from landlord)
exports.createLandlordTransaction = async (req, res) => {
 try {
  const { transactionType, propertyId, amount } = req.body;
  const proofImage = req.file ? req.file.path : "";

  if (!["listing_fee", "subscription_premium"].includes(transactionType)) {
   return res.status(400).json({ message: "Invalid transaction type" });
  }

  const transaction = await Transaction.create({
   landlordId: req.user._id,
   transactionType,
   propertyId: propertyId || null,
   amount: Number(amount),
   proofOfPaymentImage: proofImage,
   status: "pending",
  });

  res.status(201).json(transaction);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// POST /api/transactions/booking/:propertyId — tenant books a property
exports.createBookingTransaction = async (req, res) => {
 try {
  const property = await Property.findById(req.params.propertyId);
  if (!property) return res.status(404).json({ message: "Property not found" });
  if (property.status !== "available") {
   return res
    .status(400)
    .json({ message: "Property is not available for booking" });
  }

  const proofImage = req.file ? req.file.path : "";

  const transaction = await Transaction.create({
   landlordId: property.landlordId,
   tenantId: req.user._id,
   transactionType: "property_booking",
   propertyId: property._id,
   amount: Number(req.body.amount),
   proofOfPaymentImage: proofImage,
   status: "pending",
  });

  res.status(201).json(transaction);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// GET /api/transactions/landlord/billing — landlord's own billing history
exports.getLandlordBilling = async (req, res) => {
 try {
  const transactions = await Transaction.find({
   landlordId: req.user._id,
   transactionType: { $in: ["listing_fee", "subscription_premium"] },
  })
   .populate("propertyId", "title")
   .sort({ createdAt: -1 });
  res.json(transactions);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// GET /api/transactions/landlord/orders — incoming tenant orders for this landlord
exports.getLandlordOrders = async (req, res) => {
 try {
  const orders = await Transaction.find({
   landlordId: req.user._id,
   transactionType: "property_booking",
  })
   .populate("tenantId", "name email contactNumber")
   .populate("propertyId", "title images price propertyAdType")
   .sort({ createdAt: -1 });
  res.json(orders);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// PUT /api/transactions/landlord/orders/:id — landlord approves/rejects booking
exports.respondToOrder = async (req, res) => {
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
  if (transaction.landlordId.toString() !== req.user._id.toString()) {
   return res.status(403).json({ message: "Not authorized" });
  }
  if (transaction.transactionType !== "property_booking") {
   return res.status(400).json({ message: "Not a booking transaction" });
  }

  transaction.status = status;
  await transaction.save();

  // If approved, update property status to booked
  if (status === "approved" && transaction.propertyId) {
   await Property.findByIdAndUpdate(transaction.propertyId, {
    status: "booked",
   });
  }

  res.json(transaction);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// GET /api/transactions/tenant/bookings — tenant's own booking history
exports.getTenantBookings = async (req, res) => {
 try {
  const bookings = await Transaction.find({
   tenantId: req.user._id,
   transactionType: "property_booking",
  })
   .populate(
    "propertyId",
    "title images price city propertyAdType propertyType",
   )
   .populate("landlordId", "name contactNumber")
   .sort({ createdAt: -1 });
  res.json(bookings);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// PUT /api/transactions/landlord/billing/:id/proof — upload proof for listing fee / subscription
exports.uploadBillingProof = async (req, res) => {
 try {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction)
   return res.status(404).json({ message: "Transaction not found" });
  if (transaction.landlordId.toString() !== req.user._id.toString()) {
   return res.status(403).json({ message: "Not authorized" });
  }

  const proofImage = req.file ? req.file.path : "";
  transaction.proofOfPaymentImage = proofImage;
  transaction.status = "pending";
  await transaction.save();

  res.json(transaction);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};
