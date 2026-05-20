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
 Flag,
 AlertTriangle,
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

const REPORT_REASONS = [
 { value: "fraud", label: "Fraud / Fake listing" },
 { value: "scam", label: "Scam attempt" },
 { value: "wrong_information", label: "Wrong or misleading information" },
 { value: "inappropriate_content", label: "Inappropriate content" },
 { value: "other", label: "Other" },
];

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

 // Report States
 const [canReport, setCanReport] = useState(false);
 const [hasReported, setHasReported] = useState(false);
 const [reportModal, setReportModal] = useState(false);
 const [reportForm, setReportForm] = useState({ reason: "", description: "" });
 const [reportLoading, setReportLoading] = useState(false);

 const userId = user?._id;
 const userRole = user?.role;

 useEffect(() => {
  let isMounted = true;

  api
   .get(`/properties/${id}`)
   .then(({ data }) => {
    if (isMounted) setProperty(data);
   })
   .catch((err) => {
    if (isMounted && err.response?.status === 404) setNotFound(true);
   })
   .finally(() => {
    if (isMounted) setLoading(false);
   });

  if (userRole === "tenant") {
   api
    .get("/favorites/ids")
    .then((r) => {
     if (isMounted) setIsFavorited(r.data.includes(id));
    })
    .catch(() => {});

   api
    .get(`/reports/check-booked/${id}`)
    .then(({ data }) => {
     if (isMounted) setCanReport(data.hasBooked);
    })
    .catch(() => {});

   api
    .get(`/reports/check/${id}`)
    .then(({ data }) => {
     if (isMounted) setHasReported(data.hasReported);
    })
    .catch(() => {});
  }

  return () => {
   isMounted = false;
  };
 }, [id, userId, userRole]);

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
  : ["https://unsplash.com"];
 const landlord = property.landlordId;
 const isBooked = property.status === "booked";
 const floorLabel = formatFloor(property.floor, property.propertyType);

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
  if (userRole !== "tenant")
   return toast({
    message: "Only tenants can book properties",
    type: "warning",
   });
  navigate(`/checkout/${id}`);
 };

 const handleReport = async () => {
  if (!reportForm.reason)
   return toast({ message: "Please select a reason", type: "error" });
  setReportLoading(true);
  try {
   await api.post(`/reports/${id}`, reportForm);
   toast({
    message: "Report submitted. Our team will review it.",
    type: "success",
   });
   setHasReported(true);
   setReportModal(false);
   setReportForm({ reason: "", description: "" });
  } catch (err) {
   toast({
    message: err.response?.data?.message || "Failed to submit report",
    type: "error",
   });
  } finally {
   setReportLoading(false);
  }
 };

 return (
  <PublicLayout>
   <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <button
     onClick={() => navigate(-1)}
     className="flex items-center gap-2 text-gray-500 hover:text-[#002F34] mb-5 transition-colors text-sm font-medium"
    >
     <ChevronLeft size={18} /> Back
    </button>

    <div
     className="grid gap-2 rounded-2xl overflow-hidden mb-8"
     style={{ gridTemplateColumns: "3fr 2fr", height: "420px" }}
    >
     <div
      className="relative cursor-pointer overflow-hidden"
      onClick={() => {
       setActiveImage(0);
       setLightboxOpen(true);
      }}
     >
      <img
       src={images[0]}
       alt="main"
       className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
      />
     </div>

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
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
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
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
       />
       {images.length > 3 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
         <span className="text-white font-semibold text-xl">
          +{images.length - 3} Photos
         </span>
        </div>
       )}
      </div>
     </div>
    </div>

    <div className="flex flex-col lg:flex-row gap-8">
     <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
       <div className="flex items-center gap-2 flex-wrap">
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
       <div className="flex items-center gap-2">
        {userRole === "tenant" && canReport && (
         <button
          onClick={() => (hasReported ? null : setReportModal(true))}
          disabled={hasReported}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
           hasReported
            ? "border-gray-200 text-gray-400 cursor-not-allowed"
            : "border-red-200 text-red-500 hover:bg-red-50"
          }`}
          title={hasReported ? "Already reported" : "Report this property"}
         >
          <Flag size={13} />
          {hasReported ? "Reported" : "Report"}
         </button>
        )}
        {userRole === "tenant" && (
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
      </div>

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
         <Icon size={18} className="text-gray-400 shrink-0" />
         <span>{label}</span>
        </div>
       ))}
      </div>

      <hr className="border-gray-100 mb-5" />

      <div className="mb-6">
       <h2 className="text-lg font-bold text-gray-900 mb-3">
        About this property
       </h2>
       <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
        {property.description}
       </p>
      </div>

      <hr className="border-gray-100 mb-5" />

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

      <div>
       <h2 className="text-lg font-bold text-gray-900 mb-2">Location</h2>
       <p className="text-gray-600 text-sm">{property.fullAddress}</p>
      </div>
     </div>

     <div className="lg:w-80 shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">
       <h3 className="font-bold text-gray-900 mb-4">Contact Landlord</h3>

       <button
        onClick={() => navigate(`/landlord-profile/${landlord?._id}`)}
        className="flex items-center gap-3 mb-5 hover:opacity-80 transition-opacity text-left w-full"
       >
        {landlord?.profileImage ? (
         <img
          src={landlord.profileImage}
          alt={landlord.name}
          className="w-10 h-10 rounded-full object-cover shrink-0"
         />
        ) : (
         <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ backgroundColor: "#002F34" }}
         >
          {landlord?.name?.[0] || "L"}
         </div>
        )}
        <div>
         <p className="font-semibold text-sm text-gray-900 hover:text-[#002F34] transition-colors">
          {landlord?.name || "Landlord"}
         </p>
         <p className="text-xs text-gray-400">View profile & listings →</p>
        </div>
       </button>

       <div className="space-y-2.5">
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

        <a
         href={`mailto:${landlord?.email}`}
         className="w-full py-3 rounded-xl border border-gray-200 font-medium text-sm flex items-center justify-center gap-2 text-gray-700 hover:border-[#002F34] transition-colors"
        >
         <Mail size={16} /> Send Email
        </a>

        {landlord?.contactNumber && (
         <a
          href={`tel:${landlord.contactNumber}`}
          className="w-full py-3 rounded-xl border border-gray-200 font-medium text-sm flex items-center justify-center gap-2 text-gray-700 hover:border-[#002F34] transition-colors"
         >
          <Phone size={16} /> Phone Number
         </a>
        )}

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

   {lightboxOpen && (
    <div
     className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
     onClick={() => setLightboxOpen(false)}
    >
     <button
      className="absolute top-4 right-4 text-white p-2"
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

   {reportModal && (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
     <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
      <div className="flex items-center gap-3 mb-5">
       <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
        <AlertTriangle size={20} className="text-red-500" />
       </div>
       <div>
        <h3 className="font-bold text-gray-900">Report this property</h3>
        <p className="text-xs text-gray-400 mt-0.5">
         Your report will be reviewed by our team.
        </p>
       </div>
      </div>

      <div className="space-y-4">
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
         Reason
        </label>
        <select
         value={reportForm.reason}
         onChange={(e) =>
          setReportForm((f) => ({ ...f, reason: e.target.value }))
         }
         className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400"
        >
         <option value="">Select a reason...</option>
         {REPORT_REASONS.map(({ value, label }) => (
          <option key={value} value={value}>
           {label}
          </option>
         ))}
        </select>
       </div>
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
         Additional details <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
         value={reportForm.description}
         onChange={(e) =>
          setReportForm((f) => ({ ...f, description: e.target.value }))
         }
         placeholder="Describe the issue..."
         rows={3}
         className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400 resize-none"
        />
       </div>
      </div>

      <div className="flex gap-3 mt-5">
       <button
        onClick={() => {
         setReportModal(false);
         setReportForm({ reason: "", description: "" });
        }}
        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700"
       >
        Cancel
       </button>
       <button
        onClick={handleReport}
        disabled={reportLoading || !reportForm.reason}
        className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
       >
        {reportLoading ? (
         <LoadingSpinner size="sm" />
        ) : (
         <>
          <Flag size={14} /> Submit Report
         </>
        )}
       </button>
      </div>
     </div>
    </div>
   )}
  </PublicLayout>
 );
};

export default PropertyDetailPage;
