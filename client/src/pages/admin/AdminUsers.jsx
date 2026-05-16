import { useCallback, useEffect, useState } from "react";
import { ShieldOff, ShieldCheck, Users } from "lucide-react";
import api from "../../utils/axios";
import AdminLayout from "./AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import Pagination from "../../components/Pagination";
import { formatDate, getInitials } from "../../utils/helpers";
import { useToast } from "../../hooks/useToast";

const AdminUsers = () => {
 const toast = useToast();
 const [users, setUsers] = useState([]);
 const [loading, setLoading] = useState(true);
 const [filter, setFilter] = useState({ role: "", status: "" });
 const [currentPage, setCurrentPage] = useState(1);
 const [pages, setPages] = useState(1);
 const [total, setTotal] = useState(0);
 const [confirmModal, setConfirmModal] = useState(null);

 const fetchData = useCallback(
  async (page = 1) => {
   setLoading(true);
   try {
    const params = { page, limit: 15, ...filter };
    const { data } = await api.get("/admin/users", { params });
    setUsers(data.users);
    setPages(data.pages);
    setTotal(data.total);
    setCurrentPage(data.currentPage);
   } catch {
    toast({ message: "Failed to load users", type: "error" });
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

 const handleToggleBan = async () => {
  const newStatus = confirmModal.status === "banned" ? "active" : "banned";
  try {
   await api.put(`/admin/users/${confirmModal._id}`, { status: newStatus });
   toast({
    message: `User ${newStatus === "banned" ? "banned" : "unbanned"}`,
    type: "success",
   });
   setConfirmModal(null);
   fetchData(currentPage);
  } catch {
   toast({ message: "Action failed", type: "error" });
  }
 };

 return (
  <AdminLayout>
   <div className="flex items-center justify-between mb-6">
    <div>
     <h1 className="text-2xl font-bold text-gray-900">Users</h1>
     <p className="text-gray-500 text-sm mt-0.5">
      Manage all users — {total} total
     </p>
    </div>
   </div>

   {/* Filters */}
   <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 flex flex-wrap gap-3">
    <select
     value={filter.role}
     onChange={(e) => setFilter((f) => ({ ...f, role: e.target.value }))}
     className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#002F34]"
    >
     <option value="">All Roles</option>
     <option value="landlord">Landlord</option>
     <option value="tenant">Tenant</option>
    </select>
    <select
     value={filter.status}
     onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
     className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#002F34]"
    >
     <option value="">All Status</option>
     <option value="active">Active</option>
     <option value="banned">Banned</option>
    </select>
   </div>

   <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    {loading ? (
     <div className="flex justify-center py-16">
      <LoadingSpinner size="lg" />
     </div>
    ) : users.length === 0 ? (
     <div className="text-center py-16 text-gray-400">
      <Users size={32} className="mx-auto mb-3 opacity-40" />
      <p>No users found.</p>
     </div>
    ) : (
     <div className="overflow-x-auto">
      <table className="w-full text-sm">
       <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
         {[
          "User",
          "Role",
          "Contact",
          "Subscription",
          "Status",
          "Joined",
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
        {users.map((u) => (
         <tr
          key={u._id}
          className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/50 ${u.status === "banned" ? "opacity-60" : ""}`}
         >
          <td className="px-4 py-3">
           <div className="flex items-center gap-3">
            {u.profileImage ? (
             <img
              src={u.profileImage}
              alt=""
              className="w-9 h-9 rounded-full object-cover shrink-0"
             />
            ) : (
             <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: "#002F34" }}
             >
              {getInitials(u.name)}
             </div>
            )}
            <div>
             <p className="font-medium text-gray-800">{u.name}</p>
             <p className="text-xs text-gray-400">{u.email}</p>
            </div>
           </div>
          </td>
          <td className="px-4 py-3">
           <span
            className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${u.role === "landlord" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
           >
            {u.role}
           </span>
          </td>
          <td className="px-4 py-3 text-gray-500 text-xs">
           {u.contactNumber || "—"}
          </td>
          <td className="px-4 py-3">
           {u.role === "landlord" ? (
            <span
             className={`text-xs px-2 py-1 rounded-full font-medium ${u.subscriptionStatus === "premium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}
            >
             {u.subscriptionStatus === "premium" ? "Premium" : "Free"}
            </span>
           ) : (
            <span className="text-gray-400 text-xs">—</span>
           )}
          </td>
          <td className="px-4 py-3">
           <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
           >
            {u.status}
           </span>
          </td>
          <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
           {formatDate(u.createdAt)}
          </td>
          <td className="px-4 py-3">
           <button
            onClick={() => setConfirmModal(u)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
             u.status === "banned"
              ? "bg-green-50 text-green-700 hover:bg-green-100"
              : "bg-red-50 text-red-600 hover:bg-red-100"
            }`}
           >
            {u.status === "banned" ? (
             <>
              <ShieldCheck size={13} /> Unban
             </>
            ) : (
             <>
              <ShieldOff size={13} /> Ban
             </>
            )}
           </button>
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

   {/* Confirm modal */}
   {confirmModal && (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
     <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
      <div
       className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmModal.status === "banned" ? "bg-green-100" : "bg-red-100"}`}
      >
       {confirmModal.status === "banned" ? (
        <ShieldCheck size={22} className="text-green-600" />
       ) : (
        <ShieldOff size={22} className="text-red-500" />
       )}
      </div>
      <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
       {confirmModal.status === "banned" ? "Unban User?" : "Ban User?"}
      </h3>
      <p className="text-sm text-gray-500 text-center mb-5">
       <strong>{confirmModal.name}</strong> will be{" "}
       {confirmModal.status === "banned"
        ? "restored and able to login again."
        : "banned and blocked from the platform."}
      </p>
      <div className="flex gap-3">
       <button
        onClick={() => setConfirmModal(null)}
        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700"
       >
        Cancel
       </button>
       <button
        onClick={handleToggleBan}
        className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold ${confirmModal.status === "banned" ? "bg-green-600" : "bg-red-500"}`}
       >
        {confirmModal.status === "banned" ? "Yes, Unban" : "Yes, Ban"}
       </button>
      </div>
     </div>
    </div>
   )}
  </AdminLayout>
 );
};

export default AdminUsers;
