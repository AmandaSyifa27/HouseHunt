import { useEffect, useState, useCallback } from "react";
import { Heart } from "lucide-react";
import api from "../../utils/axios";
import PublicLayout from "../../components/PublicLayout";
import PropertyCard from "../../components/PropertyCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useToast } from "../../hooks/useToast";

const FavoritesPage = () => {
 const toast = useToast();
 const [properties, setProperties] = useState([]);
 const [favoriteIds, setFavoriteIds] = useState([]);
 const [loading, setLoading] = useState(true);

 const fetchFavorites = useCallback(async () => {
  try {
   const { data } = await api.get("/favorites");
   setProperties(data);
   setFavoriteIds(data.map((p) => p._id));
  } catch {
   toast({ message: "Failed to load favorites", type: "error" });
  } finally {
   setLoading(false);
  }
 }, [toast]);

 //  useEffect(() => {
 //   fetchFavorites();
 //  }, [fetchFavorites]);

 useEffect(() => {
  const timer = setTimeout(() => {
   fetchFavorites();
  }, 0);
  return () => clearTimeout(timer);
 }, [fetchFavorites]);

 const handleFavoriteToggle = async (propertyId) => {
  try {
   await api.delete(`/favorites/${propertyId}`);
   setProperties((prev) => prev.filter((p) => p._id !== propertyId));
   setFavoriteIds((prev) => prev.filter((id) => id !== propertyId));
   toast({ message: "Removed from favorites", type: "success" });
  } catch {
   toast({ message: "Failed to remove", type: "error" });
  }
 };

 return (
  <PublicLayout>
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="mb-6">
     <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
     <p className="text-gray-500 text-sm mt-0.5">
      {properties.length} saved propert{properties.length !== 1 ? "ies" : "y"}
     </p>
    </div>

    {loading ? (
     <div className="flex justify-center py-20">
      <LoadingSpinner size="lg" />
     </div>
    ) : properties.length === 0 ? (
     <div className="text-center py-24">
      <div className="w-16 h-16 rounded-full bg-[#EBEEEF] flex items-center justify-center mx-auto mb-4">
       <Heart size={28} className="text-gray-400" />
      </div>
      <h2 className="text-lg font-semibold text-gray-700 mb-1">
       No favorites yet
      </h2>
      <p className="text-gray-400 text-sm">
       Properties you save will appear here.
      </p>
     </div>
    ) : (
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
  </PublicLayout>
 );
};

export default FavoritesPage;
