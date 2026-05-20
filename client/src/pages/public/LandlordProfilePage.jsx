import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
 ChevronLeft,
 Phone,
 Mail,
 Star,
 Building2,
 Calendar,
 CheckCircle,
} from "lucide-react";
import api from "../../utils/axios";
import PublicLayout from "../../components/PublicLayout";
import PropertyCard from "../../components/PropertyCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorPage from "./ErrorPage";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { getInitials, formatDate } from "../../utils/helpers";

const LandlordProfilePage = () => {
 const { landlordId } = useParams();
 const navigate = useNavigate();
 const { user } = useAuth();
 const toast = useToast();

 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [notFound, setNotFound] = useState(false);
 const [favoriteIds, setFavoriteIds] = useState([]);

 useEffect(() => {
  api
   .get(`/auth/landlord/${landlordId}`)
   .then(({ data: d }) => setData(d))
   .catch((err) => {
    if (err.response?.status === 404) setNotFound(true);
   })
   .finally(() => setLoading(false));

  if (user?.role === "tenant") {
   api
    .get("/favorites/ids")
    .then(({ data: ids }) => setFavoriteIds(ids))
    .catch(() => {});
  }
 }, [landlordId, user]);

 const handleFavoriteToggle = async (propertyId, isFav) => {
  if (!user) return navigate("/login");
  try {
   if (isFav) {
    await api.delete(`/favorites/${propertyId}`);
    setFavoriteIds((prev) => prev.filter((id) => id !== propertyId));
   } else {
    await api.post(`/favorites/${propertyId}`);
    setFavoriteIds((prev) => [...prev, propertyId]);
   }
  } catch {
   toast({ message: "Failed to update favorites", type: "error" });
  }
 };

 if (loading)
  return (
   <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
   </div>
  );
 if (notFound) return <ErrorPage type="notfound" />;
 if (!data) return null;

 const { landlord, properties, totalListings } = data;

 return (
  <PublicLayout>
   <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Back */}
    <button
     onClick={() => navigate(-1)}
     className="flex items-center gap-2 text-gray-500 hover:text-[#002F34] mb-6 transition-colors text-sm font-medium"
    >
     <ChevronLeft size={18} /> Back
    </button>

    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
     <div className="flex flex-col sm:flex-row items-start gap-5">
      {/* Avatar */}
      {landlord.profileImage ? (
       <img
        src={landlord.profileImage}
        alt={landlord.name}
        className="w-20 h-20 rounded-2xl object-cover shrink-0"
       />
      ) : (
       <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
        style={{ backgroundColor: "#002F34" }}
       >
        {getInitials(landlord.name)}
       </div>
      )}

      <div className="flex-1 min-w-0">
       <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
         <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">{landlord.name}</h1>
          {landlord.subscriptionStatus === "premium" && (
           <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            <Star size={11} className="fill-yellow-500 text-yellow-500" />{" "}
            Premium
           </span>
          )}
         </div>
         <p className="text-gray-500 text-sm mt-1">Property Landlord</p>
        </div>

        <div className="flex items-center gap-4 text-sm">
         <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{totalListings}</p>
          <p className="text-xs text-gray-400">Total Listings</p>
         </div>
         <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
           {properties.length}
          </p>
          <p className="text-xs text-gray-400">Available Now</p>
         </div>
        </div>
       </div>

       <div className="flex flex-wrap gap-4 mt-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
         <Calendar size={14} className="text-gray-400" />
         <span>Member since {formatDate(landlord.createdAt)}</span>
        </div>
        {landlord.contactNumber && (
         <a
          href={`tel:${landlord.contactNumber}`}
          className="flex items-center gap-1.5 text-sm text-[#002F34] hover:underline font-medium"
         >
          <Phone size={14} />
          {landlord.contactNumber}
         </a>
        )}
        <a
         href={`mailto:${landlord.email}`}
         className="flex items-center gap-1.5 text-sm text-[#002F34] hover:underline font-medium"
        >
         <Mail size={14} />
         {landlord.email}
        </a>
       </div>

       <div className="flex items-center gap-1.5 mt-3 text-xs text-green-600">
        <CheckCircle size={13} className="text-green-500" />
        <span>Verified landlord on HouseHunt</span>
       </div>
      </div>
     </div>
    </div>

    <div>
     <h2 className="text-xl font-bold text-gray-900 mb-5">
      Available Listings
      <span className="text-gray-400 text-base font-normal ml-2">
       ({properties.length})
      </span>
     </h2>

     {properties.length === 0 ? (
      <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
       <Building2 size={36} className="mx-auto mb-3 text-gray-300" />
       <p className="text-gray-500 font-medium">
        No available listings right now
       </p>
       <p className="text-gray-400 text-sm mt-1">
        Check back later for new properties.
       </p>
      </div>
     ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
       {properties.map((p) => (
        <PropertyCard
         key={p._id}
         property={p}
         isFavorited={favoriteIds.includes(p._id)}
         onFavoriteToggle={handleFavoriteToggle}
        />
       ))}
      </div>
     )}
    </div>
   </div>
  </PublicLayout>
 );
};

export default LandlordProfilePage;
