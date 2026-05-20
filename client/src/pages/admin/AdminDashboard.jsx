import { useEffect, useState } from "react";
import {
 Users,
 Building2,
 TrendingUp,
 Clock,
 CheckCircle,
 UserCheck,
} from "lucide-react";
import api from "../../utils/axios";
import AdminLayout from "./AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useToast } from "../../hooks/useToast";
import { useNavigate } from "react-router-dom";

const StatCard = ({ Icon, label, value, sub, accent }) => (
 <div className="bg-white rounded-2xl p-5 border border-gray-100">
  <div className="flex items-start justify-between mb-3">
   <div
    className="w-10 h-10 rounded-xl flex items-center justify-center"
    style={{ backgroundColor: `${accent}18` }}
   >
    <Icon size={20} style={{ color: accent }} />
   </div>
   {sub && (
    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
     {sub}
    </span>
   )}
  </div>
  <p className="text-2xl font-bold text-gray-900">
   {value?.toLocaleString() ?? "—"}
  </p>
  <p className="text-xs text-gray-500 mt-1">{label}</p>
 </div>
);

const AdminDashboard = () => {
 const [stats, setStats] = useState(null);
 const [loading, setLoading] = useState(true);
 const toast = useToast();
 const navigate = useNavigate();

 useEffect(() => {
  api
   .get("/admin/stats")
   .then((r) => setStats(r.data))
   .catch(() => toast({ message: "Failed to load stats", type: "error" }))
   .finally(() => setLoading(false));
 }, [toast]);

 const handleApprove = async (id) => {
  try {
   await api.put(`/admin/transactions/${id}`, { status: "approved" });
   toast({ message: "Transaction approved", type: "success" });
   const r = await api.get("/admin/stats");
   setStats(r.data);
  } catch {
   toast({ message: "Failed to approve", type: "error" });
  }
 };

 const handleReject = async (id) => {
  try {
   await api.put(`/admin/transactions/${id}`, { status: "rejected" });
   toast({ message: "Transaction rejected", type: "success" });
   const r = await api.get("/admin/stats");
   setStats(r.data);
  } catch {
   toast({ message: "Failed to reject", type: "error" });
  }
 };

 if (loading)
  return (
   <AdminLayout>
    <div className="flex justify-center py-20">
     <LoadingSpinner size="lg" />
    </div>
   </AdminLayout>
  );

 return (
  <AdminLayout>
   <div className="mb-6">
    <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
    <p className="text-gray-500 text-sm mt-0.5">
     Here is what is happening with HouseHunt today.
    </p>
   </div>

   {/* Stats grid */}
   <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <StatCard
     Icon={Users}
     label="Total Users"
     value={stats?.totalUsers}
     sub="+12%"
     accent="#3A77FF"
    />
    <StatCard
     Icon={Building2}
     label="Active Listings"
     value={stats?.activeListings}
     sub="+5%"
     accent="#00A896"
    />
    <StatCard
     Icon={Clock}
     label="Pending Transactions"
     value={stats?.pendingTransactions}
     sub={
      stats?.pendingTransactions > 0 ? `${stats.pendingTransactions} New` : null
     }
     accent="#F59E0B"
    />
    <StatCard
     Icon={TrendingUp}
     label="Booked Properties"
     value={stats?.bookedListings}
     accent="#002F34"
    />
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
     <h2 className="font-semibold text-gray-900 mb-4">Property Types</h2>
     {stats?.propertyTypeBreakdown?.length > 0 ? (
      <div className="space-y-3">
       {stats.propertyTypeBreakdown.map(({ _id, count }) => {
        const total = stats.propertyTypeBreakdown.reduce(
         (s, t) => s + t.count,
         0,
        );
        const pct = Math.round((count / total) * 100);
        const colors = {
         Apartment: "#3A77FF",
         House: "#00A896",
         Villa: "#002F34",
        };
        return (
         <div key={_id}>
          <div className="flex justify-between text-sm mb-1">
           <span className="text-gray-700">{_id}</span>
           <span className="font-semibold">{pct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
           <div
            className="h-full rounded-full transition-all"
            style={{
             width: `${pct}%`,
             backgroundColor: colors[_id] || "#002F34",
            }}
           />
          </div>
         </div>
        );
       })}
      </div>
     ) : (
      <p className="text-sm text-gray-400">No data yet.</p>
     )}

     <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-3 text-xs text-gray-500">
      <div className="flex items-center gap-1.5">
       <UserCheck size={14} className="text-green-500" />
       <span>
        Landlords: <strong>{stats?.totalLandlords}</strong>
       </span>
      </div>
      <div className="flex items-center gap-1.5">
       <Users size={14} className="text-blue-500" />
       <span>
        Tenants: <strong>{stats?.totalTenants}</strong>
       </span>
      </div>
     </div>
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 p-5">
     <div className="flex items-center justify-between mb-4">
      <h2 className="font-semibold text-gray-900">Recently Registered</h2>
      <button
       onClick={() => navigate("/admin/users")}
       className="text-xs text-[#00A896] hover:underline"
      >
       View All
      </button>
     </div>
     <div className="space-y-3">
      {stats?.recentUsers?.map((u) => (
       <div key={u._id} className="flex items-center gap-3">
        <div
         className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
         style={{ backgroundColor: "#002F34" }}
        >
         {u.name[0]}
        </div>
        <div className="flex-1 min-w-0">
         <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
         <p className="text-xs text-gray-400 truncate">{u.email}</p>
        </div>
        <span
         className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${u.role === "landlord" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
        >
         {u.role}
        </span>
       </div>
      ))}
     </div>
    </div>
   </div>

   <div className="bg-white rounded-2xl border border-gray-100 p-5">
    <div className="flex items-center justify-between mb-4">
     <h2 className="font-semibold text-gray-900">Pending Transactions</h2>
     <button
      onClick={() => navigate("/admin/transactions")}
      className="text-xs text-[#00A896] hover:underline"
     >
      View All
     </button>
    </div>
    {stats?.recentTransactions?.length > 0 ? (
     <div className="overflow-x-auto">
      <table className="w-full text-sm">
       <thead>
        <tr className="text-xs text-gray-400 border-b border-gray-50">
         <th className="text-left pb-3 font-medium">Landlord</th>
         <th className="text-left pb-3 font-medium">Amount</th>
         <th className="text-left pb-3 font-medium">Type</th>
         <th className="text-left pb-3 font-medium">Proof</th>
         <th className="text-left pb-3 font-medium">Actions</th>
        </tr>
       </thead>
       <tbody>
        {stats.recentTransactions.map((t) => (
         <tr key={t._id} className="border-b border-gray-50 last:border-0">
          <td className="py-3">
           <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
             {t.landlordId?.name?.[0]}
            </div>
            <span className="font-medium text-gray-800">
             {t.landlordId?.name}
            </span>
           </div>
          </td>
          <td className="py-3 text-gray-700">
           Rp {t.amount?.toLocaleString("id-ID")}
          </td>
          <td className="py-3">
           <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.transactionType === "subscription_premium" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}`}
           >
            {t.transactionType === "subscription_premium"
             ? "SUBSCRIPTION"
             : "LISTING FEE"}
           </span>
          </td>
          <td className="py-3">
           {t.proofOfPaymentImage ? (
            <a
             href={t.proofOfPaymentImage}
             target="_blank"
             rel="noreferrer"
             className="flex items-center gap-1 text-[#3A77FF] text-xs hover:underline"
            >
             <CheckCircle size={13} /> View Proof
            </a>
           ) : (
            <span className="text-gray-400 text-xs">No proof</span>
           )}
          </td>
          <td className="py-3">
           <div className="flex gap-2">
            <button
             onClick={() => handleApprove(t._id)}
             className="px-3 py-1 rounded-lg text-xs font-semibold text-white"
             style={{ backgroundColor: "#00A896" }}
            >
             Approve
            </button>
            <button
             onClick={() => handleReject(t._id)}
             className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-red-500"
            >
             Reject
            </button>
           </div>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    ) : (
     <p className="text-sm text-gray-400 py-4 text-center">
      No pending transactions.
     </p>
    )}
   </div>
  </AdminLayout>
 );
};

export default AdminDashboard;
