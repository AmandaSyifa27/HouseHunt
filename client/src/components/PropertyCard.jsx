import { Link, useNavigate } from "react-router-dom";
import { Heart, MapPin, Bed, Bath, Maximize, Star } from "lucide-react";
import {
 formatPrice,
 PROPERTY_TYPE_COLORS,
 isNewProperty,
} from "../utils/helpers";
import { useAuth } from "../hooks/useAuth";

const PropertyCard = ({ property, isFavorited = false, onFavoriteToggle }) => {
 const { user } = useAuth();
 const navigate = useNavigate();
 const isBooked = property.status === "booked";
 const typeColor = PROPERTY_TYPE_COLORS[property.propertyType] || "bg-blue-500";
 const mainImage =
  property.images?.[0] ||
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800";

 const handleFavorite = (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (onFavoriteToggle) onFavoriteToggle(property._id, isFavorited);
 };

 return (
  <Link to={`/properties/${property._id}`} className="block group">
   <div
    className={`bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 ${isBooked ? "opacity-70" : ""}`}
   >
    <div className="relative h-48 overflow-hidden">
     <img
      src={mainImage}
      alt={property.title}
      className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isBooked ? "grayscale" : ""}`}
     />

     {isBooked && (
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
       <span className="text-white font-bold text-2xl tracking-widest rotate-[-15deg] border-4 border-white px-4 py-1 rounded">
        {property.propertyAdType === "Sale" ? "SOLD" : "BOOKED"}
       </span>
      </div>
     )}

     <div className="absolute top-3 left-3 flex flex-col items-start gap-1">
      {property.isRecommended && !isBooked && (
       <span className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
        <Star size={10} className="fill-yellow-900" /> Recommended
       </span>
      )}
      {isNewProperty(property.createdAt) && !isBooked && (
       <span
        className="text-white text-xs font-semibold px-2 py-0.5 rounded-full w-fit"
        style={{ backgroundColor: "#3A77FF" }}
       >
        NEW
       </span>
      )}
     </div>

     <div className="absolute bottom-3 left-3">
      <span
       className={`${typeColor} text-white text-xs font-medium px-2 py-0.5 rounded-md`}
      >
       {property.propertyType}
      </span>
     </div>

     {user?.role === "tenant" && (
      <button
       onClick={handleFavorite}
       className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
      >
       <Heart
        size={16}
        className={isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"}
       />
      </button>
     )}
     {!user && (
      <button
       onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate("/login");
       }}
       className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
      >
       <Heart size={16} className="text-gray-400" />
      </button>
     )}
    </div>

    <div className="p-4">
     <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1 mb-1">
      {property.title}
     </h3>
     <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
      <MapPin size={11} />
      <span className="line-clamp-1">{property.city}</span>
     </div>

     <div className="mb-3">
      <span className="text-[#002F34] font-bold text-base">
       {formatPrice(property.price, property.propertyAdType)}
      </span>
     </div>

     <div className="flex items-center gap-3 text-gray-500 text-xs border-t border-gray-50 pt-3">
      <div className="flex items-center gap-1">
       <Bed size={13} />
       <span>
        {property.bedrooms === 0 ? "Studio" : `${property.bedrooms} Beds`}
       </span>
      </div>
      <div className="flex items-center gap-1">
       <Bath size={13} />
       <span>{property.bathrooms} Baths</span>
      </div>
      <div className="flex items-center gap-1">
       <Maximize size={13} />
       <span>{property.buildingArea} m²</span>
      </div>
     </div>
    </div>
   </div>
  </Link>
 );
};

export default PropertyCard;
