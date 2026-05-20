import { useEffect, useState, useCallback } from "react";
import { Flag, EyeOff, ShieldOff, CheckCircle } from "lucide-react";
import api from "../../utils/axios";
import AdminLayout from "./AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import Pagination from "../../components/Pagination";
import { formatDate } from "../../utils/helpers";
import { useToast } from "../../hooks/useToast";

const REASON_LABELS = {
 fraud: "Fraud / Fake listing",
 scam: "Scam attempt",
 wrong_information: "Wrong information",
 inappropriate_content: "Inappropriate content",
 other: "Other",
};

const AdminReports = () => {
 const toast = useToast();
 const [reports, setReports] = useState([]);
 const [loading, setLoading] = useState(true);
 const [filterStatus, setFilterStatus] = useState("");
 const [currentPage, setCurrentPage] = useState(1);
 const [pages, setPages] = useState(1);
 const [total, setTotal] = useState(0);

 const fetchData = useCallback(
  async (page = 1) => {
   setLoading(true);
   try {
    const params = { page, limit: 15 };
    if (filterStatus) params.status = filterStatus;
    const { data } = await api.get("/admin/reports", { params });
    setReports(data.reports);
    setPages(data.pages);
    setTotal(data.total);
    setCurrentPage(data.currentPage);
   } catch {
    toast({ message: "Failed to load reports", type: "error" });
   } finally {
    setLoading(false);
   }
  },
  [filterStatus, toast],
 );

 useEffect(() => {
  const timer = setTimeout(() => {
   fetchData();
  }, 0);

  return () => clearTimeout(timer);
 }, [fetchData]);

 const handleAction = async (
  reportId,
  status,
  propertyId,
  landlordId,
  action,
 ) => {
  try {
   await api.put(`/admin/reports/${reportId}`, { status });
   if (action === "hide_property") {
    await api.put(`/admin/properties/${propertyId}`, { status: "hidden" });
    toast({ message: "Report reviewed — property hidden", type: "success" });
   } else if (action === "ban_landlord") {
    await api.put(`/admin/users/${landlordId}`, { status: "banned" });
    toast({ message: "Report reviewed — landlord banned", type: "success" });
   } else {
    toast({ message: "Report dismissed", type: "success" });
   }
   fetchData(currentPage);
  } catch {
   toast({ message: "Action failed", type: "error" });
  }
 };

 return (
  <AdminLayout>
   <div className="flex items-center justify-between mb-6">
    <div>
     <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
     <p className="text-gray-500 text-sm mt-0.5">
      Tenant reports on properties — {total} total
     </p>
    </div>
   </div>

   <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5">
    <select
     value={filterStatus}
     onChange={(e) => setFilterStatus(e.target.value)}
     className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#002F34]"
    >
     <option value="">All Status</option>
     <option value="pending">Pending</option>
     <option value="reviewed">Reviewed</option>
     <option value="dismissed">Dismissed</option>
    </select>
   </div>

   <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    {loading ? (
     <div className="flex justify-center py-16">
      <LoadingSpinner size="lg" />
     </div>
    ) : reports.length === 0 ? (
     <div className="text-center py-16 text-gray-400">
      <Flag size={32} className="mx-auto mb-3 opacity-40" />
      <p>No reports found.</p>
     </div>
    ) : (
     <div className="overflow-x-auto">
      <table className="w-full text-sm">
       <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
         {[
          "Property",
          "Reported By",
          "Landlord",
          "Reason",
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
        {reports.map((r) => (
         <tr
          key={r._id}
          className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
         >
          <td className="px-4 py-3">
           <div className="flex items-center gap-2">
            {r.propertyId?.images?.[0] && (
             <img
              src={r.propertyId.images[0]}
              alt=""
              className="w-9 h-9 rounded-lg object-cover shrink-0"
             />
            )}
            <div>
             <p className="font-medium text-gray-800 max-w-35 truncate">
              {r.propertyId?.title}
             </p>
             <p className="text-xs text-gray-400">{r.propertyId?.city}</p>
            </div>
           </div>
          </td>
          <td className="px-4 py-3">
           <p className="text-gray-700 font-medium">{r.tenantId?.name}</p>
           <p className="text-xs text-gray-400">{r.tenantId?.email}</p>
          </td>
          <td className="px-4 py-3">
           <p className="text-gray-700">{r.landlordId?.name}</p>
          </td>
          <td className="px-4 py-3">
           <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
            {REASON_LABELS[r.reason] || r.reason}
           </span>
           {r.description && (
            <p className="text-xs text-gray-400 mt-1 max-w-37.5 truncate">
             {r.description}
            </p>
           )}
          </td>
          <td className="px-4 py-3">
           <span
            className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
             r.status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : r.status === "reviewed"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
           >
            {r.status}
           </span>
          </td>
          <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
           {formatDate(r.createdAt)}
          </td>
          <td className="px-4 py-3">
           {r.status === "pending" ? (
            <div className="flex flex-col gap-1.5">
             <button
              onClick={() =>
               handleAction(
                r._id,
                "reviewed",
                r.propertyId?._id,
                null,
                "hide_property",
               )
              }
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
             >
              <EyeOff size={12} /> Hide Property
             </button>
             <button
              onClick={() =>
               handleAction(
                r._id,
                "reviewed",
                null,
                r.landlordId?._id,
                "ban_landlord",
               )
              }
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100"
             >
              <ShieldOff size={12} /> Ban Landlord
             </button>
             <button
              onClick={() =>
               handleAction(r._id, "dismissed", null, null, "dismiss")
              }
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-50 text-gray-500 hover:bg-gray-100"
             >
              <CheckCircle size={12} /> Dismiss
             </button>
            </div>
           ) : (
            <span className="text-gray-300 text-xs">—</span>
           )}
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
  </AdminLayout>
 );
};

export default AdminReports;
