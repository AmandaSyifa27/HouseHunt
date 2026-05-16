const Favorite = require("../models/Favorite");
const Property = require("../models/Property");

// GET /api/favorites
exports.getFavorites = async (req, res) => {
 try {
  const favorites = await Favorite.find({ tenantId: req.user._id })
   .populate({
    path: "propertyId",
    populate: { path: "landlordId", select: "name" },
   })
   .sort({ createdAt: -1 });

  const properties = favorites
   .filter((f) => f.propertyId)
   .map((f) => f.propertyId);

  res.json(properties);
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// GET /api/favorites/ids — just get favorited property IDs for the UI
exports.getFavoriteIds = async (req, res) => {
 try {
  const favorites = await Favorite.find({ tenantId: req.user._id }).select(
   "propertyId",
  );
  res.json(favorites.map((f) => f.propertyId.toString()));
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// POST /api/favorites/:propertyId
exports.addFavorite = async (req, res) => {
 try {
  const property = await Property.findById(req.params.propertyId);
  if (!property) return res.status(404).json({ message: "Property not found" });

  const existing = await Favorite.findOne({
   tenantId: req.user._id,
   propertyId: req.params.propertyId,
  });
  if (existing)
   return res.status(400).json({ message: "Already in favorites" });

  await Favorite.create({
   tenantId: req.user._id,
   propertyId: req.params.propertyId,
  });
  res.status(201).json({ message: "Added to favorites" });
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};

// DELETE /api/favorites/:propertyId
exports.removeFavorite = async (req, res) => {
 try {
  const result = await Favorite.findOneAndDelete({
   tenantId: req.user._id,
   propertyId: req.params.propertyId,
  });
  if (!result) return res.status(404).json({ message: "Favorite not found" });
  res.json({ message: "Removed from favorites" });
 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};
