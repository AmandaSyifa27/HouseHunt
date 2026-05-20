const Property = require("../models/Property");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// GET /api/properties — public, with filters + pagination
exports.getAll = async (req, res) => {
 try {
  const {
   city,
   propertyType,
   propertyAdType,
   minPrice,
   maxPrice,
   bedrooms,
   minArea,
   maxArea,
   isRecommended,
   page = 1,
   limit = 9,
  } = req.query;

  const match = { status: { $in: ["available", "booked"] } };

  if (city) match.city = { $regex: city, $options: "i" };
  if (propertyType) match.propertyType = propertyType;
  if (propertyAdType) match.propertyAdType = propertyAdType;
  if (minPrice || maxPrice) {
   match.price = {};
   if (minPrice) match.price.$gte = Number(minPrice);
   if (maxPrice) match.price.$lte = Number(maxPrice);
  }
  if (bedrooms && bedrooms !== "any") {
   if (bedrooms === "4+") match.bedrooms = { $gte: 4 };
   else match.bedrooms = Number(bedrooms);
  }
  if (minArea || maxArea) {
   match.buildingArea = {};
   if (minArea) match.buildingArea.$gte = Number(minArea);
   if (maxArea) match.buildingArea.$lte = Number(maxArea);
  }
  if (isRecommended === "true") match.isRecommended = true;

  const skip = (Number(page) - 1) * Number(limit);

  const [properties, total] = await Promise.all([
   Property.aggregate([
    { $match: match },
    {
     $addFields: {
      statusOrder: {
       $switch: {
        branches: [
         {
          case: {
           $and: [
            { $eq: ["$isRecommended", true] },
            { $eq: ["$status", "available"] },
           ],
          },
          then: 0,
         },
         { case: { $eq: ["$status", "available"] }, then: 1 },
         { case: { $eq: ["$status", "booked"] }, then: 2 },
        ],
        default: 3,
       },
      },
     },
    },
    { $sort: { statusOrder: 1, createdAt: -1 } },
    { $skip: skip },
    { $limit: Number(limit) },
   ]),
   Property.countDocuments(match),
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

// GET /api/properties/:id — public (also allows landlord to see own pending_payment)
exports.getById = async (req, res) => {
 try {
  const property = await Property.findById(req.params.id).populate(
   "landlordId",
   "name email contactNumber profileImage",
  );
  if (!property) return res.status(404).json({ message: "Property not found" });

  // Hidden/pending_payment only visible to the owner
  if (["hidden", "pending_payment"].includes(property.status)) {
   const userId = req.user?._id?.toString();
   if (!userId || property.landlordId._id.toString() !== userId) {
    return res.status(404).json({ message: "Property not found" });
   }
  }

  res.json(property);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// POST /api/properties — landlord only
exports.create = async (req, res) => {
 try {
  const landlord = await User.findById(req.user._id);
  const imageUrls = req.files ? req.files.map((f) => f.path) : [];

  const {
   title,
   description,
   propertyType,
   propertyAdType,
   price,
   city,
   fullAddress,
   gmapsLink,
   amenities,
   bedrooms,
   bathrooms,
   buildingArea,
   surfaceArea,
   floor,
  } = req.body;

  let status = "available";
  if (!landlord.freePostUsed) {
   status = "available";
  } else if (landlord.subscriptionStatus !== "premium") {
   status = "pending_payment";
  }

  const property = await Property.create({
   landlordId: req.user._id,
   title,
   description,
   propertyType,
   propertyAdType,
   price: Number(price),
   city,
   fullAddress,
   gmapsLink,
   amenities: amenities
    ? Array.isArray(amenities)
      ? amenities
      : JSON.parse(amenities)
    : [],
   images: imageUrls,
   bedrooms: Number(bedrooms),
   bathrooms: Number(bathrooms),
   buildingArea: Number(buildingArea),
   surfaceArea: surfaceArea ? Number(surfaceArea) : undefined,
   floor: floor ? Number(floor) : 1,
   status,
  });

  // Mark free post used (only once, regardless of premium)
  if (!landlord.freePostUsed) {
   await User.findByIdAndUpdate(req.user._id, { freePostUsed: true });
  }

  res
   .status(201)
   .json({ property, requiresPayment: status === "pending_payment" });
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// PUT /api/properties/:id — landlord (owner) — works for ALL statuses incl. pending_payment
exports.update = async (req, res) => {
 try {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: "Property not found" });
  if (property.landlordId.toString() !== req.user._id.toString()) {
   return res.status(403).json({ message: "Not authorized" });
  }

  const newImageUrls = req.files ? req.files.map((f) => f.path) : [];
  const existingImages = req.body.existingImages
   ? Array.isArray(req.body.existingImages)
     ? req.body.existingImages
     : [req.body.existingImages]
   : property.images;

  const updates = { ...req.body };
  if (req.body.amenities) {
   updates.amenities = Array.isArray(req.body.amenities)
    ? req.body.amenities
    : JSON.parse(req.body.amenities);
  }
  updates.images = [...existingImages, ...newImageUrls];
  delete updates.existingImages;
  // Never allow landlord to change status directly
  delete updates.status;

  const updated = await Property.findByIdAndUpdate(req.params.id, updates, {
   new: true,
  });
  res.json(updated);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// DELETE /api/properties/:id — landlord (owner)
exports.remove = async (req, res) => {
 try {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: "Property not found" });
  if (property.landlordId.toString() !== req.user._id.toString()) {
   return res.status(403).json({ message: "Not authorized" });
  }

  for (const imageUrl of property.images) {
   const publicId = imageUrl.split("/").slice(-2).join("/").split(".")[0];
   await cloudinary.uploader.destroy(publicId).catch(() => {});
  }

  await property.deleteOne();
  res.json({ message: "Property deleted successfully" });
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// PUT /api/properties/:id/recommended — premium only
exports.toggleRecommended = async (req, res) => {
 try {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: "Property not found" });
  if (property.landlordId.toString() !== req.user._id.toString()) {
   return res.status(403).json({ message: "Not authorized" });
  }

  const landlord = await User.findById(req.user._id);
  if (landlord.subscriptionStatus !== "premium") {
   return res.status(403).json({ message: "Premium subscription required" });
  }
  if (!property.isRecommended && landlord.recommendedPinsLeft <= 0) {
   return res.status(400).json({
    message: "No recommended pins left. Upgrade or wait for renewal.",
   });
  }

  const newRecommended = !property.isRecommended;
  const pinChange = newRecommended ? -1 : 1;
  await User.findByIdAndUpdate(req.user._id, {
   $inc: { recommendedPinsLeft: pinChange },
  });
  property.isRecommended = newRecommended;
  await property.save();

  res.json({ isRecommended: property.isRecommended });
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// GET /api/properties/landlord/my — landlord's own properties (ALL statuses)
exports.getLandlordProperties = async (req, res) => {
 try {
  const properties = await Property.find({ landlordId: req.user._id }).sort({
   createdAt: -1,
  });
  res.json(properties);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// GET /api/properties/landlord/pending — pending_payment properties for billing dropdown
exports.getPendingProperties = async (req, res) => {
 try {
  const properties = await Property.find({
   landlordId: req.user._id,
   status: "pending_payment",
  }).select("_id title city");
  res.json(properties);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// GET /api/properties/cities — distinct cities for autocomplete
exports.getCities = async (req, res) => {
 try {
  const cities = await Property.distinct("city", {
   status: { $in: ["available", "booked"] },
  });
  res.json(cities.sort());
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};
