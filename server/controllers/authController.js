const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
 jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || "7d",
 });

// POST /api/auth/register
exports.register = async (req, res) => {
 try {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
   return res
    .status(400)
    .json({ message: "Please fill in all required fields" });
  }
  if (!["tenant", "landlord"].includes(role)) {
   return res.status(400).json({ message: "Invalid role" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser)
   return res.status(400).json({ message: "Email already registered" });

  const user = await User.create({ name, email, password, role });

  res.status(201).json({
   token: generateToken(user._id),
   user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    subscriptionStatus: user.subscriptionStatus,
    freePostUsed: user.freePostUsed,
    profileImage: user.profileImage,
    contactNumber: user.contactNumber,
   },
  });
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// POST /api/auth/login
exports.login = async (req, res) => {
 try {
  const { email, password } = req.body;
  if (!email || !password)
   return res
    .status(400)
    .json({ message: "Please provide email and password" });

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
   return res.status(401).json({ message: "Invalid email or password" });
  }
  if (user.status === "banned") {
   return res
    .status(403)
    .json({ message: "Your account has been suspended. Contact support." });
  }

  res.json({
   token: generateToken(user._id),
   user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    subscriptionStatus: user.subscriptionStatus,
    freePostUsed: user.freePostUsed,
    profileImage: user.profileImage,
    contactNumber: user.contactNumber,
   },
  });
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
 try {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
 try {
  const { name, contactNumber } = req.body;
  const updateData = {};
  if (name) updateData.name = name;
  if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
  if (req.file) updateData.profileImage = req.file.path;

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
   new: true,
   runValidators: true,
  }).select("-password");

  res.json(user);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// PUT /api/auth/password
exports.updatePassword = async (req, res) => {
 try {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!(await user.matchPassword(currentPassword))) {
   return res.status(401).json({ message: "Current password is incorrect" });
  }
  if (newPassword.length < 8) {
   return res
    .status(400)
    .json({ message: "Password must be at least 8 characters" });
  }

  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated successfully" });
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// GET /api/auth/landlord/:id — public landlord profile
exports.getLandlordProfile = async (req, res) => {
  try {
    const landlord = await User.findById(req.params.id)
      .select('name email contactNumber profileImage createdAt subscriptionStatus role');

    if (!landlord || landlord.role !== 'landlord') {
      return res.status(404).json({ message: 'Landlord not found' });
    }

    const Property = require('../models/Property');
    const properties = await Property.find({
      landlordId: req.params.id,
      status: 'available',
    })
      .sort({ isRecommended: -1, createdAt: -1 })
      .limit(12);

    const totalListings = await Property.countDocuments({
      landlordId: req.params.id,
      status: { $in: ['available', 'booked'] },
    });

    res.json({ landlord, properties, totalListings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
