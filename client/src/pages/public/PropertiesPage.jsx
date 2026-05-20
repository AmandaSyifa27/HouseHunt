import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, RotateCcw } from "lucide-react";
import api from "../../utils/axios";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import PropertyCard from "../../components/PropertyCard";
import Pagination from "../../components/Pagination";
import LoadingSpinner from "../../components/LoadingSpinner";
import PublicLayout from "../../components/PublicLayout";

const INITIAL_FILTERS = {
 propertyType: [],
 propertyAdType: [],
 minPrice: "",
 maxPrice: "",
 bedrooms: "any",
 minArea: "",
 maxArea: "",
};

const BEDROOM_OPTIONS = ["any", "0", "1", "2", "3", "4+"];

const Sidebar = ({
 resetFilters,
 inputValues,
 setInputValues,
 filters,
 toggleMultiFilter,
 setFilters,
}) => (
 <aside className="w-full lg:w-64 shrink-0">
  <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
   <div className="flex items-center justify-between mb-5">
    <h3 className="font-semibold text-gray-900">Filters</h3>
    <button
     onClick={resetFilters}
     className="flex items-center gap-1 text-xs text-[#00A896] hover:underline"
    >
     <RotateCcw size={12} /> Reset
    </button>
   </div>

   {/* Price Range */}
   <div className="mb-5">
    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
     Price Range (USD)
    </p>
    <div className="flex gap-2">
     <input
      type="number"
      value={inputValues.minPrice}
      onChange={(e) =>
       setInputValues((v) => ({ ...v, minPrice: e.target.value }))
      }
      placeholder="Min"
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#002F34]"
     />
     <input
      type="number"
      value={inputValues.maxPrice}
      onChange={(e) =>
       setInputValues((v) => ({ ...v, maxPrice: e.target.value }))
      }
      placeholder="Max"
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#002F34]"
     />
    </div>
   </div>

   <div className="mb-5">
    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
     Property Type
    </p>
    {["Apartment", "House", "Villa"].map((type) => (
     <label
      key={type}
      className="flex items-center gap-2.5 mb-2 cursor-pointer"
     >
      <input
       type="checkbox"
       checked={filters.propertyType.includes(type)}
       onChange={() => toggleMultiFilter("propertyType", type)}
       className="w-4 h-4 rounded accent-[#002F34]"
      />
      <span className="text-sm text-gray-700">{type}</span>
     </label>
    ))}
   </div>

   <div className="mb-5">
    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
     Ad Type
    </p>
    {["Sale", "Rent"].map((type) => (
     <label
      key={type}
      className="flex items-center gap-2.5 mb-2 cursor-pointer"
     >
      <input
       type="checkbox"
       checked={filters.propertyAdType.includes(type)}
       onChange={() => toggleMultiFilter("propertyAdType", type)}
       className="w-4 h-4 rounded accent-[#002F34]"
      />
      <span className="text-sm text-gray-700">{type}</span>
     </label>
    ))}
   </div>

   <div className="mb-5">
    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
     Bedrooms
    </p>
    <div className="flex flex-wrap gap-2">
     {BEDROOM_OPTIONS.map((opt) => (
      <button
       key={opt}
       onClick={() => setFilters((f) => ({ ...f, bedrooms: opt }))}
       className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        filters.bedrooms === opt
         ? "text-white"
         : "bg-gray-100 text-gray-600 hover:bg-gray-200"
       }`}
       style={filters.bedrooms === opt ? { backgroundColor: "#002F34" } : {}}
      >
       {opt === "0" ? "Studio" : opt === "any" ? "Any" : opt}
      </button>
     ))}
    </div>
   </div>

   <div className="mb-5">
    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
     Building Area (m²)
    </p>
    <div className="flex gap-2">
     <input
      type="number"
      value={inputValues.minArea}
      onChange={(e) =>
       setInputValues((v) => ({ ...v, minArea: e.target.value }))
      }
      placeholder="Min"
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#002F34]"
     />
     <input
      type="number"
      value={inputValues.maxArea}
      onChange={(e) =>
       setInputValues((v) => ({ ...v, maxArea: e.target.value }))
      }
      placeholder="Max"
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#002F34]"
     />
    </div>
   </div>
  </div>
 </aside>
);

const PropertiesPage = () => {
 const [searchParams] = useSearchParams();
 const { user } = useAuth();
 const toast = useToast();

 const [properties, setProperties] = useState([]);
 const [total, setTotal] = useState(0);
 const [pages, setPages] = useState(1);
 const [currentPage, setCurrentPage] = useState(1);
 const [loading, setLoading] = useState(true);
 const [favoriteIds, setFavoriteIds] = useState([]);
 const [filtersOpen, setFiltersOpen] = useState(false);

 const [filters, setFilters] = useState(() => ({
  ...INITIAL_FILTERS,
  propertyType: searchParams.get("propertyType")
   ? [searchParams.get("propertyType")]
   : [],
  propertyAdType: searchParams.get("propertyAdType")
   ? [searchParams.get("propertyAdType")]
   : [],
  minPrice: searchParams.get("minPrice") || "",
  maxPrice: searchParams.get("maxPrice") || "",
 }));

 const [inputValues, setInputValues] = useState({
  minPrice: searchParams.get("minPrice") || "",
  maxPrice: searchParams.get("maxPrice") || "",
  minArea: "",
  maxArea: "",
 });

 const applyNumericFilters = () => {
  setFilters((f) => ({
   ...f,
   minPrice: inputValues.minPrice,
   maxPrice: inputValues.maxPrice,
   minArea: inputValues.minArea,
   maxArea: inputValues.maxArea,
  }));
 };

 useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
   setFilters((f) => ({
    ...f,
    minPrice: inputValues.minPrice,
    maxPrice: inputValues.maxPrice,
    minArea: inputValues.minArea,
    maxArea: inputValues.maxArea,
   }));
  }, 500);

  return () => clearTimeout(delayDebounceFn);
 }, [inputValues]);

 const handleInputKeyDown = (e) => {
  if (e.key === "Enter") applyNumericFilters();
 };

 const cityQuery = searchParams.get("city") || "";

 const inFlightRef = useRef(false);

 const fetchProperties = useCallback(
  async (page = 1) => {
   if (inFlightRef.current) return;
   inFlightRef.current = true;
   setLoading(true);
   try {
    const params = { page, limit: 9 };
    if (cityQuery) params.city = cityQuery;
    if (filters.propertyType.length === 1)
     params.propertyType = filters.propertyType[0];
    if (filters.propertyAdType.length === 1)
     params.propertyAdType = filters.propertyAdType[0];
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.bedrooms !== "any") params.bedrooms = filters.bedrooms;
    if (filters.minArea) params.minArea = filters.minArea;
    if (filters.maxArea) params.maxArea = filters.maxArea;

    const { data } = await api.get("/properties", { params });
    setProperties(data.properties);
    setTotal(data.total);
    setPages(data.pages);
    setCurrentPage(data.currentPage);
   } catch {
    toast({ message: "Failed to load properties", type: "error" });
   } finally {
    setLoading(false);
    inFlightRef.current = false;
   }
  },
  [filters, cityQuery, toast],
 );

 useEffect(() => {
  queueMicrotask(() => fetchProperties(1));
 }, [fetchProperties]);

 useEffect(() => {
  if (user?.role === "tenant") {
   api
    .get("/favorites/ids")
    .then((r) => setFavoriteIds(r.data))
    .catch(() => {});
  }
 }, [user]);

 const handleFavoriteToggle = async (propertyId, isFavorited) => {
  if (!user) return;
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

 const toggleMultiFilter = (key, value) => {
  setFilters((f) => ({
   ...f,
   [key]: f[key].includes(value)
    ? f[key].filter((v) => v !== value)
    : [...f[key], value],
  }));
 };

 const resetFilters = () => {
  setFilters(INITIAL_FILTERS);
  setInputValues({ minPrice: "", maxPrice: "", minArea: "", maxArea: "" });
 };

 return (
  <PublicLayout>
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex flex-col lg:flex-row gap-6">
     <div className="hidden lg:block">
      <Sidebar
       resetFilters={resetFilters}
       inputValues={inputValues}
       setInputValues={setInputValues}
       applyNumericFilters={applyNumericFilters}
       handleInputKeyDown={handleInputKeyDown}
       filters={filters}
       toggleMultiFilter={toggleMultiFilter}
       setFilters={setFilters}
      />
     </div>

     <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between mb-5">
       <div>
        <h1 className="text-2xl font-bold text-gray-900">
         {cityQuery ? `Properties in ${cityQuery}` : "All Properties"}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
         Showing {total} result{total !== 1 ? "s" : ""}
        </p>
       </div>

       <button
        onClick={() => setFiltersOpen(true)}
        className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700"
       >
        <SlidersHorizontal size={16} /> Filters
       </button>
      </div>

      {loading ? (
       <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
       </div>
      ) : properties.length === 0 ? (
       <div className="text-center py-20 text-gray-400">
        <SlidersHorizontal size={32} className="mx-auto mb-3 opacity-40" />
        <p className="font-medium">No properties found</p>
        <p className="text-sm mt-1">Try adjusting your filters.</p>
       </div>
      ) : (
       <>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
         {properties.map((p) => (
          <PropertyCard
           key={p._id}
           property={p}
           isFavorited={favoriteIds.includes(p._id)}
           onFavoriteToggle={handleFavoriteToggle}
          />
         ))}
        </div>
        <Pagination
         currentPage={currentPage}
         totalPages={pages}
         onPageChange={(page) => fetchProperties(page)}
        />
       </>
      )}
     </div>
    </div>
   </div>

   {filtersOpen && (
    <div className="fixed inset-0 z-50 lg:hidden">
     <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setFiltersOpen(false)}
     />
     <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto p-5">
      <div className="flex items-center justify-between mb-4">
       <h3 className="font-semibold">Filters</h3>
       <button onClick={() => setFiltersOpen(false)}>
        <X size={20} className="text-gray-500" />
       </button>
      </div>
      <Sidebar
       resetFilters={resetFilters}
       inputValues={inputValues}
       setInputValues={setInputValues}
       applyNumericFilters={applyNumericFilters}
       handleInputKeyDown={handleInputKeyDown}
       filters={filters}
       toggleMultiFilter={toggleMultiFilter}
       setFilters={setFilters}
      />
     </div>
    </div>
   )}
  </PublicLayout>
 );
};

export default PropertiesPage;
