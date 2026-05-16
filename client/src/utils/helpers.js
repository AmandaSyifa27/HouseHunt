export const formatPrice = (price, adType) => {
 const formatted = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
 }).format(price);
 return adType === "Rent" ? `${formatted}/mo` : formatted;
};

export const formatPriceShort = (price) => {
 if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
 if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}K`;
 return `$${price.toLocaleString("en-US")}`;
};

const ordinalSuffix = (n) => {
 const s = ["th", "st", "nd", "rd"];
 const v = n % 100;
 return s[(v - 20) % 10] || s[v] || s[0];
};

export const formatFloor = (floor, propertyType) => {
 if (!floor && floor !== 0) return null;
 if (propertyType === "Apartment") {
  return `${floor}${ordinalSuffix(floor)} Floor`;
 }
 return `${floor} ${floor > 1 ? "Floors" : "Floor"}`;
};

export const getInitials = (name = "") => {
 return name
  .split(" ")
  .slice(0, 2)
  .map((n) => n[0])
  .join("")
  .toUpperCase();
};

export const formatDate = (date) => {
 return new Date(date).toLocaleDateString("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
 });
};

export const timeAgo = (date) => {
 const diff = Date.now() - new Date(date).getTime();
 const minutes = Math.floor(diff / 60000);
 if (minutes < 60) return `${minutes}m ago`;
 const hours = Math.floor(minutes / 60);
 if (hours < 24) return `${hours}h ago`;
 const days = Math.floor(hours / 24);
 return `${days}d ago`;
};

export const isNewProperty = (createdAt) => {
 const daysDiff =
  (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
 return daysDiff <= 1;
};

export const PROPERTY_TYPE_COLORS = {
 Apartment: "bg-blue-500",
 House: "bg-green-600",
 Villa: "bg-purple-600",
};

export const STATUS_COLORS = {
 available: "bg-green-100 text-green-700",
 booked: "bg-gray-100 text-gray-600",
 hidden: "bg-yellow-100 text-yellow-700",
 pending_payment: "bg-orange-100 text-orange-700",
 pending: "bg-yellow-100 text-yellow-700",
 approved: "bg-green-100 text-green-700",
 rejected: "bg-red-100 text-red-700",
 banned: "bg-red-100 text-red-700",
 active: "bg-green-100 text-green-700",
};
