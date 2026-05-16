import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Star, Building2 } from "lucide-react";
import api from "../../utils/axios";
import LandlordLayout from "./LandlordLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useToast } from "../../hooks/useToast";
import { formatPrice, PROPERTY_TYPE_COLORS } from "../../utils/helpers";

const STATUS_STYLE = {
 available: "bg-green-100 text-green-700",
 booked: "bg-blue-100 text-blue-700",
 hidden: "bg-gray-100 text-gray-500",
 pending_payment: "bg-orange-100 text-orange-700",
};

const LandlordProperties = () => {
 const navigate = useNavigate();
 const toast = useToast();
 const [properties, setProperties] = useState([]);
 const [loading, setLoading] = useState(true);
 const [deleteModal, setDeleteModal] = useState(null);
 const [togglingId, setTogglingId] = useState(null);

 const fetchData = useCallback(async () => {
  try {
   const { data } = await api.get("/properties/landlord/my");
   setProperties(data);
  } catch {
   toast({ message: "Failed to load properties", type: "error" });
  } finally {
   setLoading(false);
  }
 }, [toast]);

 //  useEffect(() => {
 //   fetchData();
 //  }, [fetchData]);
 useEffect(() => {
  const timer = setTimeout(() => {
   fetchData();
  }, 0);

  return () => clearTimeout(timer);
 }, [fetchData]);

 const handleDelete = async () => {
  try {
   await api.delete(`/properties/${deleteModal._id}`);
   toast({ message: "Property deleted", type: "success" });
   setDeleteModal(null);
   fetchData();
  } catch {
   toast({ message: "Delete failed", type: "error" });
  }
 };

 const handleToggleRecommended = async (property) => {
  setTogglingId(property._id);
  try {
   await api.put(`/properties/${property._id}/recommended`);
   toast({
    message: `Recommended ${property.isRecommended ? "removed" : "enabled"}`,
    type: "success",
   });
   fetchData();
  } catch (err) {
   toast({ message: err.response?.data?.message || "Failed", type: "error" });
  } finally {
   setTogglingId(null);
  }
 };

 return (
  <LandlordLayout>
   <div className="flex items-center justify-between mb-6">
    <div>
     <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
     <p className="text-gray-500 text-sm mt-0.5">
      {properties.length} listing{properties.length !== 1 ? "s" : ""} total
     </p>
    </div>
    <button
     onClick={() => navigate("/landlord/properties/add")}
     className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
     style={{ backgroundColor: "#002F34" }}
    >
     <Plus size={16} /> Add Property
    </button>
   </div>

   {loading ? (
    <div className="flex justify-center py-20">
     <LoadingSpinner size="lg" />
    </div>
   ) : properties.length === 0 ? (
    <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
     <Building2 size={40} className="mx-auto mb-3 text-gray-300" />
     <p className="font-semibold text-gray-700 mb-1">No properties yet</p>
     <p className="text-sm text-gray-400 mb-5">
      Start by adding your first listing.
     </p>
     <button
      onClick={() => navigate("/landlord/properties/add")}
      className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
      style={{ backgroundColor: "#002F34" }}
     >
      Add Your First Property
     </button>
    </div>
   ) : (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
     <div className="overflow-x-auto">
      <table className="w-full text-sm">
       <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
         {["Property", "Type", "Price", "Status", "Recommended", "Actions"].map(
          (h) => (
           <th
            key={h}
            className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
           >
            {h}
           </th>
          ),
         )}
        </tr>
       </thead>
       <tbody>
        {properties.map((p) => (
         <tr
          key={p._id}
          className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
         >
          <td className="px-4 py-3">
           <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100">
             {p.images?.[0] ? (
              <img
               src={p.images[0]}
               alt=""
               className="w-full h-full object-cover"
              />
             ) : (
              <Building2 size={20} className="m-auto mt-3 text-gray-300" />
             )}
            </div>
            <div>
             <p className="font-medium text-gray-800 max-w-[180px] truncate">
              {p.title}
             </p>
             <p className="text-xs text-gray-400">{p.city}</p>
            </div>
           </div>
          </td>
          <td className="px-4 py-3">
           <div className="flex flex-col gap-1">
            <span
             className={`${PROPERTY_TYPE_COLORS[p.propertyType]} text-white text-xs px-2 py-0.5 rounded-md w-fit`}
            >
             {p.propertyType}
            </span>
            <span className="text-xs text-gray-400">{p.propertyAdType}</span>
           </div>
          </td>
          <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
           {formatPrice(p.price, p.propertyAdType)}
          </td>
          <td className="px-4 py-3">
           <span
            className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_STYLE[p.status] || "bg-gray-100 text-gray-600"}`}
           >
            {p.status.replace("_", " ")}
           </span>
          </td>
          <td className="px-4 py-3">
           <button
            onClick={() => handleToggleRecommended(p)}
            disabled={togglingId === p._id}
            className={`p-1.5 rounded-lg transition-colors ${p.isRecommended ? "bg-yellow-50 text-yellow-500 hover:bg-yellow-100" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
            title={
             p.isRecommended ? "Remove recommended" : "Mark as recommended"
            }
           >
            <Star
             size={16}
             className={p.isRecommended ? "fill-yellow-400" : ""}
            />
           </button>
          </td>
          <td className="px-4 py-3">
           <div className="flex items-center gap-1.5">
            <button
             onClick={() => navigate(`/landlord/properties/edit/${p._id}`)}
             className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
             <Pencil size={15} />
            </button>
            <button
             onClick={() => setDeleteModal(p)}
             className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
            >
             <Trash2 size={15} />
            </button>
           </div>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    </div>
   )}

   {deleteModal && (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
     <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
       <Trash2 size={22} className="text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-center mb-2">Delete Property?</h3>
      <p className="text-sm text-gray-500 text-center mb-5">
       <strong>"{deleteModal.title}"</strong> will be permanently deleted.
      </p>
      <div className="flex gap-3">
       <button
        onClick={() => setDeleteModal(null)}
        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium"
       >
        Cancel
       </button>
       <button
        onClick={handleDelete}
        className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold"
       >
        Delete
       </button>
      </div>
     </div>
    </div>
   )}
  </LandlordLayout>
 );
};

export default LandlordProperties;
