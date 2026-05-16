import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Filter } from "lucide-react";
import api from "../../utils/axios";
import AdminLayout from "./AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import Pagination from "../../components/Pagination";
import { formatDate } from "../../utils/helpers";
import { useToast } from "../../hooks/useToast";

const AdminTransactions = () => {
 const toast = useToast();
 const [transactions, setTransactions] = useState([]);
 const [loading, setLoading] = useState(true);
 const [filter, setFilter] = useState({ status: "", type: "" });
 const [currentPage, setCurrentPage] = useState(1);
 const [pages, setPages] = useState(1);
 const [total, setTotal] = useState(0);
 const [proofModal, setProofModal] = useState(null);

 const fetchData = useCallback(
  async (page = 1) => {
   setLoading(true);
   try {
    const params = { page, limit: 15, ...filter };
    const { data } = await api.get("/admin/transactions", { params });
    setTransactions(data.transactions);
    setPages(data.pages);
    setTotal(data.total);
    setCurrentPage(data.currentPage);
   } catch {
    toast({ message: "Failed to load transactions", type: "error" });
   } finally {
    setLoading(false);
   }
  },
  [filter, toast],
 );

 //  useEffect(() => {
 //   fetchData(1);
 //  }, [filter]);
 useEffect(() => {
  const timer = setTimeout(() => {
   fetchData(1);
  }, 0);

  return () => clearTimeout(timer);
 }, [filter, fetchData]);

 const handleAction = async (id, status) => {
  try {
   await api.put(`/admin/transactions/${id}`, { status });
   toast({ message: `Transaction ${status}`, type: "success" });
   fetchData(currentPage);
  } catch {
   toast({ message: "Action failed", type: "error" });
  }
 };

 return (
  <AdminLayout>
   <div className="flex items-center justify-between mb-6">
    <div>
     <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
     <p className="text-gray-500 text-sm mt-0.5">
      Verify landlord payments — {total} total
     </p>
    </div>
   </div>

   {/* Filters */}
   <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 flex flex-wrap gap-3">
    <select
     value={filter.status}
     onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
     className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#002F34]"
    >
     <option value="">All Status</option>
     <option value="pending">Pending</option>
     <option value="approved">Approved</option>
     <option value="rejected">Rejected</option>
    </select>
    <select
     value={filter.type}
     onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}
     className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#002F34]"
    >
     <option value="">All Types</option>
     <option value="subscription_premium">Subscription</option>
     <option value="listing_fee">Listing Fee</option>
    </select>
   </div>

   <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    {loading ? (
     <div className="flex justify-center py-16">
      <LoadingSpinner size="lg" />
     </div>
    ) : transactions.length === 0 ? (
     <div className="text-center py-16 text-gray-400">
      <Filter size={32} className="mx-auto mb-3 opacity-40" />
      <p>No transactions found.</p>
     </div>
    ) : (
     <div className="overflow-x-auto">
      <table className="w-full text-sm">
       <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
         {[
          "Landlord",
          "Type",
          "Property",
          "Amount",
          "Proof",
          "Date",
          "Status",
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
        {transactions.map((t) => (
         <tr
          key={t._id}
          className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
         >
          <td className="px-4 py-3">
           <div>
            <p className="font-medium text-gray-800">{t.landlordId?.name}</p>
            <p className="text-xs text-gray-400">{t.landlordId?.email}</p>
           </div>
          </td>
          <td className="px-4 py-3">
           <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${t.transactionType === "subscription_premium" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}`}
           >
            {t.transactionType === "subscription_premium"
             ? "SUBSCRIPTION"
             : "LISTING FEE"}
           </span>
          </td>
          <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">
           {t.propertyId?.title || "—"}
          </td>
          <td className="px-4 py-3 font-medium text-gray-800">
           Rp {t.amount?.toLocaleString("id-ID")}
          </td>
          <td className="px-4 py-3">
           {t.proofOfPaymentImage ? (
            <button
             onClick={() => setProofModal(t.proofOfPaymentImage)}
             className="flex items-center gap-1 text-[#3A77FF] text-xs hover:underline"
            >
             <ExternalLink size={13} /> View
            </button>
           ) : (
            <span className="text-gray-400 text-xs">No proof</span>
           )}
          </td>
          <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
           {formatDate(t.createdAt)}
          </td>
          <td className="px-4 py-3">
           <span
            className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
             t.status === "approved"
              ? "bg-green-100 text-green-700"
              : t.status === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
           >
            {t.status}
           </span>
          </td>
          <td className="px-4 py-3">
           {t.status === "pending" ? (
            <div className="flex gap-1.5">
             <button
              onClick={() => handleAction(t._id, "approved")}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white"
              style={{ backgroundColor: "#00A896" }}
             >
              Approve
             </button>
             <button
              onClick={() => handleAction(t._id, "rejected")}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-red-500"
             >
              Reject
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

   {/* Proof image modal */}
   {proofModal && (
    <div
     className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
     onClick={() => setProofModal(null)}
    >
     <div
      className="bg-white rounded-2xl p-3 max-w-sm w-full"
      onClick={(e) => e.stopPropagation()}
     >
      <p className="text-sm font-semibold text-gray-800 mb-3 px-1">
       Payment Proof
      </p>
      <img
       src={proofModal}
       alt="proof"
       className="w-full rounded-xl max-h-[60vh] object-contain"
      />
      <button
       onClick={() => setProofModal(null)}
       className="mt-3 w-full py-2 rounded-xl bg-gray-100 text-sm text-gray-700 font-medium"
      >
       Close
      </button>
     </div>
    </div>
   )}
  </AdminLayout>
 );
};

export default AdminTransactions;
