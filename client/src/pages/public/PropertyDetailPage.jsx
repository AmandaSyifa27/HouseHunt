import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
 MapPin,
 Bed,
 Bath,
 Maximize,
 Layers,
 Heart,
 Map,
 Mail,
 Phone,
 MessageCircle,
 ChevronLeft,
 ChevronRight,
 Star,
 X,
} from "lucide-react";
import api from "../../utils/axios";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import {
 formatPrice,
 formatFloor,
 PROPERTY_TYPE_COLORS,
} from "../../utils/helpers";
import LoadingSpinner from "../../components/LoadingSpinner";
import PublicLayout from "../../components/PublicLayout";
import ErrorPage from "./ErrorPage";

const PropertyDetailPage = () => {
 const { id } = useParams();
 const navigate = useNavigate();
 const { user } = useAuth();
 const toast = useToast();

 const [property, setProperty] = useState(null);
 const [loading, setLoading] = useState(true);
 const [notFound, setNotFound] = useState(false);
 const [isFavorited, setIsFavorited] = useState(false);
 const [activeImage, setActiveImage] = useState(0);
 const [lightboxOpen, setLightboxOpen] = useState(false);

 useEffect(() => {
  api
   .get(`/properties/${id}`)
   .then((res) => {
    setProperty(res.data);
   })
   .catch((err) => {
    if (err.response?.status === 404) setNotFound(true);
   })
   .finally(() => setLoading(false));

  if (user?.role === "tenant") {
   api
    .get("/favorites/ids")
    .then((r) => setIsFavorited(r.data.includes(id)))
    .catch(() => {});
  }
 }, [id, user]);

 if (loading)
  return (
   <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
   </div>
  );
 if (notFound) return <ErrorPage type="notfound" />;
 if (!property) return null;

 const typeColor = PROPERTY_TYPE_COLORS[property.propertyType] || "bg-blue-500";
 const images = property.images?.length
  ? property.images
  : ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"];
 const landlord = property.landlordId;
 const isBooked = property.status === "booked";

 const handleFavorite = async () => {
  if (!user) return navigate("/login");
  try {
   if (isFavorited) {
    await api.delete(`/favorites/${id}`);
    setIsFavorited(false);
    toast({ message: "Removed from favorites", type: "success" });
   } else {
    await api.post(`/favorites/${id}`);
    setIsFavorited(true);
    toast({ message: "Added to favorites", type: "success" });
   }
  } catch {
   toast({ message: "Failed to update favorites", type: "error" });
  }
 };

 const handleBook = () => {
  if (!user) return navigate("/login", { state: { from: `/checkout/${id}` } });
  if (user.role !== "tenant")
   return toast({
    message: "Only tenants can book properties",
    type: "warning",
   });
  navigate(`/checkout/${id}`);
 };

 const floorLabel = formatFloor(property.floor, property.propertyType);

 return (
  <PublicLayout>
   <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* ── Photo Gallery ── */}
    <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden mb-8 h-[420px]">
     {/* Main image */}
     <div
      className="relative cursor-pointer"
      onClick={() => {
       setActiveImage(0);
       setLightboxOpen(true);
      }}
     >
      <img src={images[0]} alt="main" className="w-full h-full object-cover" />
     </div>

     {/* Side images */}
     <div className="grid grid-rows-2 gap-2">
      <div
       className="relative cursor-pointer overflow-hidden"
       onClick={() => {
        setActiveImage(1);
        setLightboxOpen(true);
       }}
      >
       <img
        src={images[1] || images[0]}
        alt=""
        className="w-full h-full object-cover"
       />
      </div>
      <div
       className="relative cursor-pointer overflow-hidden"
       onClick={() => {
        setActiveImage(2);
        setLightboxOpen(true);
       }}
      >
       <img
        src={images[2] || images[0]}
        alt=""
        className="w-full h-full object-cover"
       />
       {images.length > 3 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
         <span className="text-white font-semibold text-lg">
          +{images.length - 3} Photos
         </span>
        </div>
       )}
      </div>
     </div>
    </div>

    {/* ── Main content ── */}
    <div className="flex flex-col lg:flex-row gap-8">
     {/* Left — property info */}
     <div className="flex-1 min-w-0">
      {/* Badges + favorite */}
      <div className="flex items-center justify-between mb-3">
       <div className="flex items-center gap-2">
        <span
         className="text-white text-xs font-semibold px-3 py-1 rounded-full"
         style={{ backgroundColor: "#00A896" }}
        >
         {property.propertyAdType === "Rent" ? "For Rent" : "For Sale"}
        </span>
        <span
         className={`${typeColor} text-white text-xs font-medium px-2 py-1 rounded-md`}
        >
         {property.propertyType}
        </span>
        {property.isRecommended && (
         <span className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
          <Star size={10} className="fill-yellow-900" /> Recommended
         </span>
        )}
       </div>
       {user?.role === "tenant" && (
        <button
         onClick={handleFavorite}
         className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-red-300 transition-colors"
        >
         <Heart
          size={18}
          className={
           isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"
          }
         />
        </button>
       )}
      </div>

      {/* Location + title */}
      <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
       <MapPin size={14} />
       <span>{property.city}</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
       {property.title}
      </h1>
      <p className="text-3xl font-bold mb-6" style={{ color: "#002F34" }}>
       {formatPrice(property.price, property.propertyAdType)}
      </p>

      <hr className="border-gray-100 mb-5" />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
       {[
        {
         Icon: Bed,
         label:
          property.bedrooms === 0 ? "Studio" : `${property.bedrooms} Bedrooms`,
        },
        { Icon: Bath, label: `${property.bathrooms} Bathrooms` },
        { Icon: Maximize, label: `${property.buildingArea} m²` },
        ...(floorLabel ? [{ Icon: Layers, label: floorLabel }] : []),
       ].map(({ Icon, label }) => (
        <div
         key={label}
         className="flex items-center gap-2 text-gray-600 text-sm"
        >
         <Icon size={18} className="text-gray-400" />
         <span>{label}</span>
        </div>
       ))}
      </div>

      <hr className="border-gray-100 mb-5" />

      {/* About */}
      <div className="mb-6">
       <h2 className="text-lg font-bold text-gray-900 mb-3">
        About this property
       </h2>
       <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
        {property.description}
       </p>
      </div>

      <hr className="border-gray-100 mb-5" />

      {/* Amenities */}
      {property.amenities?.length > 0 && (
       <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Amenities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
         {property.amenities.map((a) => (
          <div
           key={a}
           className="flex items-center gap-2 text-sm text-gray-600"
          >
           <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: "#00A896" }}
           />
           {a}
          </div>
         ))}
        </div>
       </div>
      )}

      <hr className="border-gray-100 mb-5" />

      {/* Address */}
      <div>
       <h2 className="text-lg font-bold text-gray-900 mb-2">Location</h2>
       <p className="text-gray-600 text-sm">{property.fullAddress}</p>
      </div>
     </div>

     {/* Right — contact card */}
     <div className="lg:w-80 shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">
       <h3 className="font-bold text-gray-900 mb-4">Contact Landlord</h3>

       {/* Landlord info */}
       <div className="flex items-center gap-3 mb-1">
        {landlord?.profileImage ? (
         <img
          src={landlord.profileImage}
          alt={landlord.name}
          className="w-10 h-10 rounded-full object-cover"
         />
        ) : (
         <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ backgroundColor: "#002F34" }}
         >
          {landlord?.name?.[0] || "L"}
         </div>
        )}
        <div>
         <p className="font-semibold text-sm text-gray-900">
          {landlord?.name || "Landlord"}
         </p>
         <p className="text-xs text-gray-400">
          Usually responds within an hour.
         </p>
        </div>
       </div>

       <div className="mt-5 space-y-2.5">
        {/* Book Now */}
        {!isBooked ? (
         <button
          onClick={handleBook}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-colors"
          style={{ backgroundColor: "#002F34" }}
         >
          BOOK NOW
         </button>
        ) : (
         <div className="w-full py-3 rounded-xl bg-gray-100 text-gray-500 font-semibold text-sm text-center">
          {property.propertyAdType === "Sale" ? "SOLD" : "BOOKED"}
         </div>
        )}

        {/* WhatsApp */}
        {landlord?.contactNumber && (
         <a
          href={`https://wa.me/${landlord.contactNumber.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          style={{ backgroundColor: "#00A896", color: "white" }}
         >
          <MessageCircle size={16} /> Contact via WhatsApp
         </a>
        )}

        {/* Email */}
        <a
         href={`mailto:${landlord?.email}`}
         className="w-full py-3 rounded-xl border border-gray-200 font-medium text-sm flex items-center justify-center gap-2 text-gray-700 hover:border-[#002F34] transition-colors"
        >
         <Mail size={16} /> Send Email
        </a>

        {/* Phone */}
        {landlord?.contactNumber && (
         <a
          href={`tel:${landlord.contactNumber}`}
          className="w-full py-3 rounded-xl border border-gray-200 font-medium text-sm flex items-center justify-center gap-2 text-gray-700 hover:border-[#002F34] transition-colors"
         >
          <Phone size={16} /> Phone Number
         </a>
        )}

        {/* Open Maps */}
        {property.gmapsLink && (
         <a
          href={property.gmapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-xl border border-gray-200 font-medium text-sm flex items-center justify-center gap-2 text-gray-700 hover:border-[#002F34] transition-colors"
         >
          <Map size={16} /> Open Maps
         </a>
        )}
       </div>
      </div>
     </div>
    </div>
   </div>

   {/* Lightbox */}
   {lightboxOpen && (
    <div
     className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
     onClick={() => setLightboxOpen(false)}
    >
     <button
      className="absolute top-4 right-4 text-white"
      onClick={() => setLightboxOpen(false)}
     >
      <X size={28} />
     </button>
     <button
      className="absolute left-4 text-white p-2 bg-white/10 rounded-full"
      onClick={(e) => {
       e.stopPropagation();
       setActiveImage((prev) => (prev - 1 + images.length) % images.length);
      }}
     >
      <ChevronLeft size={24} />
     </button>
     <img
      src={images[activeImage]}
      alt=""
      className="max-h-[85vh] max-w-[85vw] object-contain rounded-xl"
      onClick={(e) => e.stopPropagation()}
     />
     <button
      className="absolute right-4 text-white p-2 bg-white/10 rounded-full"
      onClick={(e) => {
       e.stopPropagation();
       setActiveImage((prev) => (prev + 1) % images.length);
      }}
     >
      <ChevronRight size={24} />
     </button>
     <div className="absolute bottom-4 text-white/60 text-sm">
      {activeImage + 1} / {images.length}
     </div>
    </div>
   )}
  </PublicLayout>
 );
};

export default PropertyDetailPage;
