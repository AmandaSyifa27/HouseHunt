import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
 Search,
 Building2,
 Shield,
 CreditCard,
 Star,
 ChevronRight,
 House,
 Building,
 TentTree,
} from "lucide-react";
import PropertyCard from "../../components/PropertyCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useEffect } from "react";
import api from "../../utils/axios";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

const HERO_IMAGE =
 "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600&q=80";

const PROPERTY_TYPES = [
 { label: "House", icon: <House size={30} color="#002F34" />, value: "House" },
 {
  label: "Apartment",
  icon: <Building size={30} color="#002F34" />,
  value: "Apartment",
 },
 {
  label: "Villa",
  icon: <TentTree size={30} color="#002F34" />,
  value: "Villa",
 },
];

const HomePage = () => {
 const navigate = useNavigate();
 const { user } = useAuth();
 const toast = useToast();

 const [searchQuery, setSearchQuery] = useState("");
 const [propertyType, setPropertyType] = useState("");
 const [recommended, setRecommended] = useState([]);
 const [loadingRecommended, setLoadingRecommended] = useState(true);
 const [favoriteIds, setFavoriteIds] = useState([]);

 useEffect(() => {
  api
   .get("/properties?isRecommended=true&limit=4")
   .then((res) => setRecommended(res.data.properties))
   .catch(() => {})
   .finally(() => setLoadingRecommended(false));

  if (user?.role === "tenant") {
   api
    .get("/favorites/ids")
    .then((res) => setFavoriteIds(res.data))
    .catch(() => {});
  }
 }, [user]);

 const handleSearch = (e) => {
  e.preventDefault();
  const params = new URLSearchParams();
  if (searchQuery) params.set("city", searchQuery);
  if (propertyType) params.set("propertyType", propertyType);
  navigate(`/properties?${params.toString()}`);
 };

 const handleTypeClick = (type) => {
  navigate(`/properties?propertyType=${type}`);
 };

 const handleFavoriteToggle = async (propertyId, isFavorited) => {
  if (!user) return navigate("/login");
  try {
   if (isFavorited) {
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

 return (
  <div>
   {/* ── Hero Section ── */}
   <section className="relative h-[480px] flex items-center justify-center overflow-hidden">
    <img
     src={HERO_IMAGE}
     alt="Hero"
     className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-black/50" />

    <div className="relative z-10 text-center text-white px-4 w-full max-w-3xl mx-auto">
     <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
      Find Your Perfect Home
     </h1>
     <p className="text-white/80 text-base mb-8">
      Discover premium properties in top neighborhoods. Your dream space is just
      a search away.
     </p>

     {/* Search bar */}
     <form
      onSubmit={handleSearch}
      className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-xl max-w-2xl mx-auto"
     >
      <div className="flex-1 flex items-center gap-2 px-3">
       <Search size={18} className="text-gray-400 shrink-0" />
       <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Location, Type, or City..."
        className="w-full text-sm text-gray-800 outline-none placeholder:text-gray-400 bg-transparent"
       />
      </div>
      <div className="h-px sm:h-auto sm:w-px bg-gray-200 mx-1" />
      <div className="flex items-center gap-2 px-3">
       <Building2 size={18} className="text-gray-400 shrink-0" />
       <select
        value={propertyType}
        onChange={(e) => setPropertyType(e.target.value)}
        className="text-sm text-gray-700 outline-none bg-transparent cursor-pointer pr-2 min-w-[130px]"
       >
        <option value="">Property Type</option>
        <option value="House">House</option>
        <option value="Apartment">Apartment</option>
        <option value="Villa">Villa</option>
       </select>
      </div>
      <button
       type="submit"
       className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors shrink-0"
       style={{ backgroundColor: "#002F34" }}
      >
       Search
      </button>
     </form>
    </div>
   </section>

   {/* ── Browse by Type ── */}
   <section className="py-12 px-4">
    <div className="max-w-7xl mx-auto">
     <div className="flex justify-center gap-8 md:gap-16">
      {PROPERTY_TYPES.map(({ label, icon, value }) => (
       <button
        key={value}
        onClick={() => handleTypeClick(value)}
        className="flex flex-col items-center gap-3 group"
       >
        <div className="w-16 h-16 rounded-full bg-[#EBEEEF] flex items-center justify-center text-2xl group-hover:bg-[#002F34]/10 transition-colors">
         <span className="text-2xl">{icon}</span>
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
       </button>
      ))}
     </div>
    </div>
   </section>

   {/* ── Recommended Properties ── */}
   <section className="pb-14 px-4">
    <div className="max-w-7xl mx-auto">
     <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
      <Link
       to="/properties?isRecommended=true"
       className="flex items-center gap-1 text-sm font-medium text-[#00A896] hover:underline"
      >
       View All <ChevronRight size={15} />
      </Link>
     </div>

     {loadingRecommended ? (
      <div className="flex justify-center py-12">
       <LoadingSpinner size="lg" />
      </div>
     ) : recommended.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
       {recommended.map((p) => (
        <PropertyCard
         key={p._id}
         property={p}
         isFavorited={favoriteIds.includes(p._id)}
         onFavoriteToggle={handleFavoriteToggle}
        />
       ))}
      </div>
     ) : (
      <div className="text-center py-12 text-gray-400">
       <Star size={32} className="mx-auto mb-3 opacity-40" />
       <p>No recommended properties yet.</p>
      </div>
     )}
    </div>
   </section>

   {/* ── Landlord CTA Banner ── */}
   <section className="mx-4 mb-14 rounded-2xl overflow-hidden">
    <div className="bg-[#002F34] px-8 py-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
     <div className="max-w-lg">
      <h2 className="text-2xl font-bold text-white mb-2">
       Ready to Become a Landlord?
      </h2>
      <p className="text-white/70 text-sm leading-relaxed">
       Join thousands of property owners who trust HouseHunt to find reliable
       tenants quickly and manage their listings effortlessly.
      </p>
      <Link
       to="/register"
       className="inline-block mt-5 px-5 py-2.5 rounded-xl border border-white text-white text-sm font-semibold hover:bg-white hover:text-[#002F34] transition-colors"
      >
       List Your Property Today
      </Link>
     </div>

     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:min-w-72">
      {[
       {
        Icon: Shield,
        title: "Verified Tenants",
        desc: "Comprehensive Background Checks.",
       },
       {
        Icon: CreditCard,
        title: "Secured Payments",
        desc: "Automated Rent Collection.",
       },
      ].map(({ Icon, title, desc }) => (
       <div
        key={title}
        className="flex items-start gap-3 bg-white/10 rounded-xl p-4 border border-white/20"
       >
        <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
         <Icon size={18} className="text-white" />
        </div>
        <div>
         <p className="font-semibold text-white text-sm">{title}</p>
         <p className="text-white/60 text-xs mt-0.5">{desc}</p>
        </div>
       </div>
      ))}
     </div>
    </div>
   </section>
  </div>
 );
};

export default HomePage;
