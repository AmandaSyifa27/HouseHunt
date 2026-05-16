const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const propertyStorage = new CloudinaryStorage({
 cloudinary,
 params: {
  folder: "househunt/properties",
  allowed_formats: ["jpg", "jpeg", "png", "webp"],
  transformation: [{ width: 1200, quality: "auto" }],
 },
});

const proofStorage = new CloudinaryStorage({
 cloudinary,
 params: {
  folder: "househunt/proofs",
  allowed_formats: ["jpg", "jpeg", "png", "pdf"],
 },
});

const profileStorage = new CloudinaryStorage({
 cloudinary,
 params: {
  folder: "househunt/profiles",
  allowed_formats: ["jpg", "jpeg", "png"],
  transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
 },
});

const fileSizeLimitMB = (mb) => ({ fileSize: mb * 1024 * 1024 });

const uploadPropertyImages = multer({
 storage: propertyStorage,
 limits: fileSizeLimitMB(5),
}).array("images", 10);

const uploadProof = multer({
 storage: proofStorage,
 limits: fileSizeLimitMB(5),
}).single("proof");

const uploadProfileImage = multer({
 storage: profileStorage,
 limits: fileSizeLimitMB(2),
}).single("profileImage");

module.exports = { uploadPropertyImages, uploadProof, uploadProfileImage };
