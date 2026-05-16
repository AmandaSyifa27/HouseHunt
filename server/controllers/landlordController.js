const Property = require("../models/Property");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

// GET /api/landlord/dashboard
exports.getDashboard = async (req, res) => {
 try {
  const [available, booked, hidden, pendingPayment, pendingOrders, landlord] =
   await Promise.all([
    Property.countDocuments({ landlordId: req.user._id, status: "available" }),
    Property.countDocuments({ landlordId: req.user._id, status: "booked" }),
    Property.countDocuments({ landlordId: req.user._id, status: "hidden" }),
    Property.countDocuments({
     landlordId: req.user._id,
     status: "pending_payment",
    }),
    Transaction.countDocuments({
     landlordId: req.user._id,
     transactionType: "property_booking",
     status: "pending",
    }),
    User.findById(req.user._id).select("-password"),
   ]);

  const recentOrders = await Transaction.find({
   landlordId: req.user._id,
   transactionType: "property_booking",
  })
   .populate("tenantId", "name email")
   .populate("propertyId", "title images price")
   .sort({ createdAt: -1 })
   .limit(5);

  res.json({
   stats: { available, booked, hidden, pendingPayment, pendingOrders },
   landlord,
   recentOrders,
  });
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};
