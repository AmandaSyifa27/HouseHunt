import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
 Search,
 Building2,
 Shield,
 CreditCard,
 Star,
 ChevronRight,
 MapPin,
 House,
 Building,
 TentTree,
} from "lucide-react";
import api from "../../utils/axios";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import PropertyCard from "../../components/PropertyCard";
import LoadingSpinner from "../../components/LoadingSpinner";

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
 const [loadingRec, setLoadingRec] = useState(true);
 const [favoriteIds, setFavoriteIds] = useState([]);
 const [cities, setCities] = useState([]);
 const [citySuggestions, setCitySuggestions] = useState([]);
 const [showSuggestions, setShowSuggestions] = useState(false);
 const suggestRef = useRef(null);

 useEffect(() => {
  api
   .get("/properties?isRecommended=true&limit=4")
   .then(({ data }) => setRecommended(data.properties))
   .catch(() => {})
   .finally(() => setLoadingRec(false));

  api
   .get("/properties/cities")
   .then(({ data }) => setCities(data))
   .catch(() => {});

  if (user?.role === "tenant") {
   api
    .get("/favorites/ids")
    .then(({ data }) => setFavoriteIds(data))
    .catch(() => {});
  }

  const handler = (e) => {
   if (suggestRef.current && !suggestRef.current.contains(e.target)) {
    setShowSuggestions(false);
   }
  };
  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
 }, [user]);

 const handleSearchInput = (val) => {
  setSearchQuery(val);
  if (val.trim().length >= 1) {
   const filtered = cities.filter((c) =>
    c.toLowerCase().includes(val.toLowerCase()),
   );
   setCitySuggestions(filtered.slice(0, 6));
   setShowSuggestions(filtered.length > 0);
  } else {
   setShowSuggestions(false);
  }
 };

 const handleSearch = (e) => {
  e.preventDefault();
  setShowSuggestions(false);
  const params = new URLSearchParams();
  if (searchQuery) params.set("city", searchQuery);
  if (propertyType) params.set("propertyType", propertyType);
  navigate(`/properties?${params.toString()}`);
 };

 const handleSuggestionClick = (city) => {
  setSearchQuery(city);
  setShowSuggestions(false);
  const params = new URLSearchParams({ city });
  if (propertyType) params.set("propertyType", propertyType);
  navigate(`/properties?${params.toString()}`);
 };

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

 return (
  <div>
   <section className="relative h-125 flex items-center justify-center overflow-hidden">
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

     <form
      onSubmit={handleSearch}
      className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-xl max-w-2xl mx-auto"
     >
      <div className="flex-1 relative" ref={suggestRef}>
       <div className="flex items-center gap-2 px-3 h-10">
        <Search size={18} className="text-gray-400 shrink-0" />
        <input
         type="text"
         value={searchQuery}
         onChange={(e) => handleSearchInput(e.target.value)}
         onFocus={() =>
          searchQuery && setShowSuggestions(citySuggestions.length > 0)
         }
         placeholder="Location, Type, or City..."
         className="w-full text-sm text-gray-800 outline-none placeholder:text-gray-400 bg-transparent"
        />
       </div>
       {showSuggestions && (
        <div className="absolute top-full left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-100 mt-1 z-50 overflow-hidden">
         {citySuggestions.map((city) => (
          <button
           key={city}
           type="button"
           onClick={() => handleSuggestionClick(city)}
           className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
           <MapPin size={14} className="text-gray-400 shrink-0" />
           {city}
          </button>
         ))}
        </div>
       )}
      </div>

      <div className="h-px sm:h-auto sm:w-px bg-gray-200 mx-1" />

      <div className="flex items-center gap-2 px-3">
       <Building2 size={18} className="text-gray-400 shrink-0" />
       <select
        value={propertyType}
        onChange={(e) => setPropertyType(e.target.value)}
        className="text-sm text-gray-700 outline-none bg-transparent cursor-pointer pr-2 min-w-32.5"
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

     {!user && (
      <div className="flex items-center justify-center gap-3 mt-5">
       <Link
        to="/login"
        className="px-5 py-2 rounded-xl text-sm font-semibold text-white border border-white/50 hover:bg-white/10 transition-colors"
       >
        Sign In
       </Link>
       <Link
        to="/register"
        className="px-5 py-2 rounded-xl text-sm font-semibold border-2 border-[#002F34] transition-colors bg-primary/50 hover:bg-primary text-white"
        style={{ backgroucolor: "white" }}
       >
        Sign Up
       </Link>
      </div>
     )}
    </div>
   </section>

   <section className="py-12 px-4">
    <div className="max-w-7xl mx-auto">
     <div className="flex justify-center gap-8 md:gap-20">
      {PROPERTY_TYPES.map(({ label, icon, value }) => (
       <button
        key={value}
        onClick={() => navigate(`/properties?propertyType=${value}`)}
        className="flex flex-col items-center gap-3 group"
       >
        <div className="w-16 h-16 rounded-full bg-[#EBEEEF] flex items-center justify-center text-2xl group-hover:bg-[#002F34]/10 transition-colors">
         {icon}
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
       </button>
      ))}
     </div>
    </div>
   </section>

   <section className="pb-14 px-4">
    <div className="max-w-7xl mx-auto">
     <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
      <Link
       to="/properties"
       className="flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
       style={{ color: "#002F34", border: "1.5px solid #002F34" }}
      >
       Browse All <ChevronRight size={15} />
      </Link>
     </div>

     {loadingRec ? (
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

   <section className="mx-4 mb-14 rounded-2xl overflow-hidden">
    <div className="bg-[#002F34] px-8 py-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
     <div className="max-w-lg">
      <h2 className="text-2xl font-bold text-white mb-2">
       Ready to Become a Landlord?
      </h2>
      <p className="text-white/70 text-sm leading-relaxed">
       Join thousands of property owners who trust HouseHunt to find reliable
       tenants quickly and manage listings effortlessly.
      </p>
      <Link
       to={user?.role === "landlord" ? "/landlord/properties/add" : "/register"}
       className="inline-block mt-5 px-5 py-2.5 rounded-xl border border-white text-white text-sm font-semibold hover:bg-white hover:text-[#002F34] transition-colors"
      >
       {user?.role === "landlord"
        ? "Post a Property"
        : "List Your Property Today"}
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
