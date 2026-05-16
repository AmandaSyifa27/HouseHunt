import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Trash2, Building2 } from "lucide-react";
import api from "../../utils/axios";
import AdminLayout from "./AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import Pagination from "../../components/Pagination";
import { formatDate, PROPERTY_TYPE_COLORS } from "../../utils/helpers";
import { useToast } from "../../hooks/useToast";

const STATUS_LABELS = {
 available: "bg-green-100 text-green-700",
 booked: "bg-gray-100 text-gray-600",
 hidden: "bg-yellow-100 text-yellow-700",
 pending_payment: "bg-orange-100 text-orange-700",
};

const AdminProperties = () => {
 const toast = useToast();
 const [properties, setProperties] = useState([]);
 const [loading, setLoading] = useState(true);
 const [filterStatus, setFilterStatus] = useState("");
 const [currentPage, setCurrentPage] = useState(1);
 const [pages, setPages] = useState(1);
 const [total, setTotal] = useState(0);
 const [deleteModal, setDeleteModal] = useState(null);

 const fetchData = useCallback(
  async (page = 1) => {
   setLoading(true);
   try {
    const params = { page, limit: 15 };
    if (filterStatus) params.status = filterStatus;
    const { data } = await api.get("/admin/properties", { params });
    setProperties(data.properties);
    setPages(data.pages);
    setTotal(data.total);
    setCurrentPage(data.currentPage);
   } catch {
    toast({ message: "Failed to load", type: "error" });
   } finally {
    setLoading(false);
   }
  },
  [filterStatus, toast],
 );

 //  useEffect(() => {
 //   fetchData(1);
 //  }, [filterStatus]);
 useEffect(() => {
  const timer = setTimeout(() => {
   fetchData(1);
  }, 0);

  return () => clearTimeout(timer);
 }, [filterStatus, fetchData]);

 const handleToggle = async (id, currentStatus) => {
  const newStatus = currentStatus === "hidden" ? "available" : "hidden";
  try {
   await api.put(`/admin/properties/${id}`, { status: newStatus });
   toast({
    message: `Property ${newStatus === "hidden" ? "hidden" : "made visible"}`,
    type: "success",
   });
   fetchData(currentPage);
  } catch {
   toast({ message: "Action failed", type: "error" });
  }
 };

 const handleDelete = async () => {
  try {
   await api.delete(`/admin/properties/${deleteModal._id}`);
   toast({ message: "Property deleted", type: "success" });
   setDeleteModal(null);
   fetchData(currentPage);
  } catch {
   toast({ message: "Delete failed", type: "error" });
  }
 };

 return (
  <AdminLayout>
   <div className="flex items-center justify-between mb-6">
    <div>
     <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
     <p className="text-gray-500 text-sm mt-0.5">
      Moderate content — {total} total
     </p>
    </div>
   </div>

   {/* Filter */}
   <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5">
    <select
     value={filterStatus}
     onChange={(e) => setFilterStatus(e.target.value)}
     className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#002F34]"
    >
     <option value="">All Status</option>
     <option value="available">Available</option>
     <option value="booked">Booked</option>
     <option value="hidden">Hidden</option>
     <option value="pending_payment">Pending Payment</option>
    </select>
   </div>

   <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    {loading ? (
     <div className="flex justify-center py-16">
      <LoadingSpinner size="lg" />
     </div>
    ) : properties.length === 0 ? (
     <div className="text-center py-16 text-gray-400">
      <Building2 size={32} className="mx-auto mb-3 opacity-40" />
      <p>No properties found.</p>
     </div>
    ) : (
     <div className="overflow-x-auto">
      <table className="w-full text-sm">
       <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
         {[
          "Property",
          "Type",
          "Landlord",
          "Price",
          "City",
          "Status",
          "Date",
          "Actions",
         ].map((h) => (
          <th
           key={h}
           className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
          >
           {h}
          </th>
         ))}
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
            <img
             src={
              p.images?.[0] ||
              "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100"
             }
             alt=""
             className="w-10 h-10 rounded-lg object-cover shrink-0"
            />
            <p className="font-medium text-gray-800 max-w-37.5 truncate">
             {p.title}
            </p>
           </div>
          </td>
          <td className="px-4 py-3">
           <span
            className={`${PROPERTY_TYPE_COLORS[p.propertyType]} text-white text-xs px-2 py-0.5 rounded-md`}
           >
            {p.propertyType}
           </span>
          </td>
          <td className="px-4 py-3 text-gray-600">{p.landlordId?.name}</td>
          <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
           Rp {p.price?.toLocaleString("id-ID")}
          </td>
          <td className="px-4 py-3 text-gray-600">{p.city}</td>
          <td className="px-4 py-3">
           <span
            className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_LABELS[p.status] || "bg-gray-100 text-gray-600"}`}
           >
            {p.status.replace("_", " ")}
           </span>
          </td>
          <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
           {formatDate(p.createdAt)}
          </td>
          <td className="px-4 py-3">
           <div className="flex items-center gap-1.5">
            <button
             onClick={() => handleToggle(p._id, p.status)}
             title={p.status === "hidden" ? "Show" : "Hide"}
             className={`p-1.5 rounded-lg transition-colors ${p.status === "hidden" ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"}`}
            >
             {p.status === "hidden" ? <Eye size={15} /> : <EyeOff size={15} />}
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
    )}
    <div className="px-4 pb-4">
     <Pagination
      currentPage={currentPage}
      totalPages={pages}
      onPageChange={fetchData}
     />
    </div>
   </div>

   {/* Delete confirm modal */}
   {deleteModal && (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
     <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
       <Trash2 size={22} className="text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
       Delete Property?
      </h3>
      <p className="text-sm text-gray-500 text-center mb-5">
       <strong>"{deleteModal.title}"</strong> will be permanently removed.
      </p>
      <div className="flex gap-3">
       <button
        onClick={() => setDeleteModal(null)}
        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700"
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
  </AdminLayout>
 );
};

export default AdminProperties;
