require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const Property = require("../models/Property");
const Transaction = require("../models/Transaction");
const Favorite = require("../models/Favorite");

const PROPERTY_IMAGES = {
 apartment: [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
 ],
 house: [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
 ],
 villa: [
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
 ],
};

const seed = async () => {
 await connectDB();

 console.log("Clearing existing data...");
 await Promise.all([
  User.deleteMany({}),
  Property.deleteMany({}),
  Transaction.deleteMany({}),
  Favorite.deleteMany({}),
 ]);

 console.log("Creating users...");
 const hashedPassword = await bcrypt.hash("Test1234!", 12);

 const [admin, landlord1, landlord2, tenant1, tenant2] = await User.insertMany([
  {
   name: "Amanda Sifa",
   email: "admin@househunt.com",
   password: await bcrypt.hash("Admin123!", 12),
   role: "admin",
   status: "active",
  },
  {
   name: "James Sterling",
   email: "james@househunt.com",
   password: hashedPassword,
   role: "landlord",
   subscriptionStatus: "premium",
   freePostUsed: true,
   recommendedPinsLeft: 2,
   contactNumber: "+62812345678",
  },
  {
   name: "Sarah Miller",
   email: "sarah@househunt.com",
   password: hashedPassword,
   role: "landlord",
   subscriptionStatus: "free",
   freePostUsed: true,
   contactNumber: "+62898765432",
  },
  {
   name: "Amanda Santos",
   email: "amanda@househunt.com",
   password: hashedPassword,
   role: "tenant",
   contactNumber: "+62877654321",
  },
  {
   name: "Budi Pratama",
   email: "budi@househunt.com",
   password: hashedPassword,
   role: "tenant",
   contactNumber: "+62855123456",
  },
 ]);

 console.log("Creating properties...");
 const properties = await Property.insertMany([
  {
   landlordId: landlord1._id,
   propertyType: "Apartment",
   propertyAdType: "Rent",
   title: "Life Goes On Apartment",
   description:
    "A luxurious high-rise apartment in the heart of Jakarta with stunning city views. Features modern furnishings, fully-equipped kitchen, and access to premium amenities including rooftop pool and gym.",
   price: 850,
   city: "Jakarta",
   fullAddress: "Jl. Sudirman No. 45, Setiabudi, Jakarta Selatan",
   gmapsLink: "https://maps.google.com/?q=-6.2088,106.8456",
   amenities: [
    "WiFi",
    "Pool",
    "Gym",
    "Parking",
    "Security",
    "Air Conditioning",
   ],
   images: PROPERTY_IMAGES.apartment,
   bedrooms: 3,
   bathrooms: 2,
   buildingArea: 120,
   floor: 25,
   status: "available",
   isRecommended: true,
  },
  {
   landlordId: landlord1._id,
   propertyType: "Villa",
   propertyAdType: "Rent",
   title: "Sweather Weather Villa",
   description:
    "A beautiful tropical villa surrounded by lush greenery in Bali. Perfect for families or groups looking for a private retreat with pool and garden.",
   price: 1500,
   city: "Bali",
   fullAddress: "Jl. Raya Seminyak No. 12, Seminyak, Badung",
   gmapsLink: "https://maps.google.com/?q=-8.6905,115.1617",
   amenities: ["Pool", "WiFi", "Parking", "Air Conditioning", "Kitchen"],
   images: PROPERTY_IMAGES.villa,
   bedrooms: 4,
   bathrooms: 3,
   buildingArea: 350,
   surfaceArea: 600,
   floor: 2,
   status: "available",
   isRecommended: true,
  },
  {
   landlordId: landlord2._id,
   propertyType: "House",
   propertyAdType: "Rent",
   title: "Maplewood Family Estate",
   description:
    "A spacious family home in a quiet residential area of Bandung. Two-story house with large garden, perfect for families with children.",
   price: 650,
   city: "Bandung",
   fullAddress: "Jl. Dago Pakar Raya No. 88, Cimenyan, Bandung",
   gmapsLink: "https://maps.google.com/?q=-6.8833,107.6197",
   amenities: ["Parking", "Garden", "Security", "WiFi"],
   images: PROPERTY_IMAGES.house,
   bedrooms: 4,
   bathrooms: 3,
   buildingArea: 250,
   surfaceArea: 400,
   floor: 2,
   status: "available",
   isRecommended: false,
  },
  {
   landlordId: landlord1._id,
   propertyType: "Apartment",
   propertyAdType: "Rent",
   title: "Skyline View Loft",
   description:
    "Modern studio apartment on the 15th floor with panoramic city views. Ideal for young professionals. Fully furnished with smart home features.",
   price: 420,
   city: "Jakarta",
   fullAddress: "Jl. TB Simatupang No. 10, Cilandak, Jakarta Selatan",
   gmapsLink: "https://maps.google.com/?q=-6.2917,106.7944",
   amenities: ["WiFi", "Gym", "Parking", "Air Conditioning", "Security"],
   images: [PROPERTY_IMAGES.apartment[1], PROPERTY_IMAGES.apartment[0]],
   bedrooms: 1,
   bathrooms: 1,
   buildingArea: 45,
   floor: 15,
   status: "available",
   isRecommended: false,
  },
  {
   landlordId: landlord2._id,
   propertyType: "House",
   propertyAdType: "Sale",
   title: "Modern Oasis Villa",
   description:
    "Premium house for sale in a prestigious location in Surabaya. This newly built property features contemporary architecture with high-quality finishes.",
   price: 350000,
   city: "Surabaya",
   fullAddress: "Jl. Darmo Permai No. 33, Sukomanunggal, Surabaya",
   gmapsLink: "https://maps.google.com/?q=-7.2575,112.7521",
   amenities: ["Pool", "Parking", "Garden", "Security", "Air Conditioning"],
   images: [PROPERTY_IMAGES.house[2], PROPERTY_IMAGES.house[0]],
   bedrooms: 5,
   bathrooms: 4,
   buildingArea: 450,
   surfaceArea: 700,
   floor: 2,
   status: "available",
   isRecommended: false,
  },
  {
   landlordId: landlord1._id,
   propertyType: "Apartment",
   propertyAdType: "Rent",
   title: "Heritage Grand Residence",
   description:
    "Classic and elegant apartment in Yogyakarta with traditional Javanese design elements combined with modern comfort.",
   price: 580,
   city: "Yogyakarta",
   fullAddress: "Jl. Malioboro No. 55, Gedongtengen, Yogyakarta",
   gmapsLink: "https://maps.google.com/?q=-7.7956,110.3695",
   amenities: ["WiFi", "Air Conditioning", "Security", "Parking"],
   images: [PROPERTY_IMAGES.apartment[2], PROPERTY_IMAGES.apartment[0]],
   bedrooms: 2,
   bathrooms: 2,
   buildingArea: 90,
   floor: 8,
   status: "booked",
   isRecommended: false,
  },
  {
   landlordId: landlord2._id,
   propertyType: "Villa",
   propertyAdType: "Sale",
   title: "Tropical Paradise Villa",
   description:
    "Stunning beachfront villa for sale in Lombok. Perfect investment property with proven rental income potential.",
   price: 580000,
   city: "Lombok",
   fullAddress: "Jl. Pantai Kuta No. 7, Pujut, Lombok Tengah",
   gmapsLink: "https://maps.google.com/?q=-8.8977,116.2756",
   amenities: ["Pool", "Beach Access", "WiFi", "Parking", "Kitchen"],
   images: [PROPERTY_IMAGES.villa[2], PROPERTY_IMAGES.villa[0]],
   bedrooms: 5,
   bathrooms: 5,
   buildingArea: 500,
   surfaceArea: 900,
   floor: 2,
   status: "available",
   isRecommended: false,
  },
  {
   landlordId: landlord1._id,
   propertyType: "House",
   propertyAdType: "Rent",
   title: "Urban Studio Retreat",
   description:
    "Cozy compact house in the creative district of Bandung. Walking distance to cafes, art galleries, and public transport.",
   price: 320,
   city: "Bandung",
   fullAddress: "Jl. Braga No. 24, Sumur Bandung, Bandung",
   gmapsLink: "https://maps.google.com/?q=-6.9167,107.6058",
   amenities: ["WiFi", "Air Conditioning", "Security"],
   images: [PROPERTY_IMAGES.house[1], PROPERTY_IMAGES.house[2]],
   bedrooms: 2,
   bathrooms: 1,
   buildingArea: 80,
   floor: 1,
   status: "available",
   isRecommended: false,
  },
 ]);

 console.log("Creating transactions...");
 await Transaction.insertMany([
  {
   landlordId: landlord2._id,
   transactionType: "listing_fee",
   propertyId: properties[2]._id,
   amount: 5,
   proofOfPaymentImage:
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
   status: "pending",
  },
  {
   landlordId: landlord1._id,
   transactionType: "subscription_premium",
   amount: 29,
   proofOfPaymentImage:
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
   status: "approved",
  },
  {
   landlordId: landlord1._id,
   tenantId: tenant1._id,
   transactionType: "property_booking",
   propertyId: properties[5]._id,
   amount: 580,
   proofOfPaymentImage:
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
   status: "approved",
  },
 ]);

 console.log("Creating favorites...");
 await Favorite.insertMany([
  { tenantId: tenant1._id, propertyId: properties[0]._id },
  { tenantId: tenant1._id, propertyId: properties[1]._id },
  { tenantId: tenant2._id, propertyId: properties[0]._id },
 ]);

 console.log("\nSeed complete!\n");
 console.log("=== Login Credentials ===");
 console.log("Admin:    admin@househunt.com    / Admin123!");
 console.log("Landlord: james@househunt.com    / Test1234!");
 console.log("Landlord: sarah@househunt.com    / Test1234!");
 console.log("Tenant:   amanda@househunt.com   / Test1234!");
 console.log("Tenant:   budi@househunt.com     / Test1234!");
 console.log("=========================\n");

 mongoose.connection.close();
};

seed().catch((err) => {
 console.error("Seed failed:", err);
 mongoose.connection.close();
 process.exit(1);
});
