import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
 Building2,
 BookCheck,
 EyeOff,
 Clock,
 Star,
 CheckCircle,
 XCircle,
 PackagePlus,
 CreditCard,
 ClipboardList,
} from "lucide-react";
import api from "../../utils/axios";
import LandlordLayout from "./LandlordLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useToast } from "../../hooks/useToast";
import { timeAgo } from "../../utils/helpers";

const StatCard = ({ Icon, label, value, accent, sub }) => (
 <div className="bg-white rounded-2xl p-5 border border-gray-100">
  <div className="flex items-start justify-between mb-3">
   <div
    className="w-10 h-10 rounded-xl flex items-center justify-center"
    style={{ backgroundColor: `${accent}18` }}
   >
    <Icon size={20} style={{ color: accent }} />
   </div>
   {sub != null && (
    <span
     className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sub > 0 ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}
    >
     {sub > 0 ? `${sub} new` : "none"}
    </span>
   )}
  </div>
  <p className="text-2xl font-bold text-gray-900">{value ?? 0}</p>
  <p className="text-xs text-gray-500 mt-1">{label}</p>
 </div>
);

const LandlordDashboard = () => {
 const navigate = useNavigate();
 const toast = useToast();
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  api
   .get("/landlord/dashboard")
   .then((r) => setData(r.data))
   .catch(() => toast({ message: "Failed to load dashboard", type: "error" }))
   .finally(() => setLoading(false));
 }, [toast]);

 if (loading)
  return (
   <LandlordLayout>
    <div className="flex justify-center py-20">
     <LoadingSpinner size="lg" />
    </div>
   </LandlordLayout>
  );

 const { stats, landlord, recentOrders } = data || {};
 const isPremium = landlord?.subscriptionStatus === "premium";

 return (
  <LandlordLayout>
   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
     <h1 className="text-2xl font-bold text-gray-900">Landlord Dashboard</h1>
     <p className="text-gray-500 text-sm mt-0.5">
      Here is a quick overview of your real estate portfolio.
     </p>
    </div>
    <button
     onClick={() => navigate("/landlord/properties/add")}
     className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
     style={{ backgroundColor: "#002F34" }}
    >
     <PackagePlus size={16} /> Post New Property
    </button>
   </div>

   <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <StatCard
     Icon={Building2}
     label="Available"
     value={stats?.available}
     accent="#00A896"
    />
    <StatCard
     Icon={BookCheck}
     label="Booked"
     value={stats?.booked}
     accent="#3A77FF"
    />
    <StatCard
     Icon={EyeOff}
     label="Hidden"
     value={stats?.hidden}
     accent="#9CA3AF"
    />
    <StatCard
     Icon={Clock}
     label="Pending Orders"
     value={stats?.pendingOrders}
     accent="#F59E0B"
     sub={stats?.pendingOrders}
    />
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
     <div className="flex items-center justify-between mb-4">
      <h2 className="font-semibold text-gray-900">Incoming Booking Requests</h2>
      <button
       onClick={() => navigate("/landlord/orders")}
       className="text-xs text-[#00A896] hover:underline"
      >
       View All
      </button>
     </div>
     {recentOrders?.length > 0 ? (
      <div className="space-y-3">
       {recentOrders.map((order) => (
        <div
         key={order._id}
         className="flex items-start gap-3 p-3 rounded-xl bg-gray-50"
        >
         <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
          <img
           src={
            order.propertyId?.images?.[0] ||
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100"
           }
           alt=""
           className="w-full h-full object-cover"
          />
         </div>
         <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
           {order.propertyId?.title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
           by <span className="font-medium">{order.tenantId?.name}</span> ·{" "}
           {timeAgo(order.createdAt)}
          </p>
         </div>
         <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-sm font-bold">
           ${order.amount?.toLocaleString()}
          </span>
          <span
           className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.status === "pending" ? "bg-yellow-100 text-yellow-700" : order.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
           {order.status}
          </span>
         </div>
        </div>
       ))}
      </div>
     ) : (
      <div className="text-center py-10 text-gray-400">
       <ClipboardList size={28} className="mx-auto mb-2 opacity-40" />
       <p className="text-sm">No booking requests yet.</p>
      </div>
     )}
    </div>

    <div className="space-y-4">
     <div
      className="rounded-2xl p-5 text-white"
      style={{ backgroundColor: isPremium ? "#002F34" : "#3A77FF" }}
     >
      <div className="flex items-center gap-2 mb-3">
       <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
        <CreditCard size={16} className="text-white" />
       </div>
       <p className="text-sm font-medium text-white/80">Subscription</p>
      </div>
      <p className="text-xl font-bold">
       {isPremium ? "Premium Plan" : "Free Plan"}
      </p>
      <p className="text-xs text-white/60 mt-1">
       {isPremium
        ? `${landlord?.recommendedPinsLeft ?? 0} recommended pins left`
        : "Upgrade to unlock recommended pins"}
      </p>
      {!isPremium && (
       <button
        onClick={() => navigate("/landlord/billing")}
        className="mt-3 w-full py-2 rounded-xl bg-white text-[#3A77FF] text-xs font-bold"
       >
        Upgrade to Premium
       </button>
      )}
     </div>

     <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <p className="text-sm font-semibold text-gray-700 mb-3">Listing Quota</p>
      <div className="space-y-2 text-xs text-gray-600">
       <div className="flex justify-between">
        <span>Free post</span>
        {landlord?.freePostUsed ? (
         <span className="flex items-center gap-1 text-red-500">
          <XCircle size={12} /> Used
         </span>
        ) : (
         <span className="flex items-center gap-1 text-green-600">
          <CheckCircle size={12} /> Available
         </span>
        )}
       </div>
       {isPremium && (
        <div className="flex justify-between">
         <span className="flex items-center gap-1">
          <Star size={11} className="text-yellow-500" /> Recommended pins
         </span>
         <span className="font-semibold">
          {landlord?.recommendedPinsLeft ?? 0} left
         </span>
        </div>
       )}
      </div>
      <button
       onClick={() => navigate("/landlord/billing")}
       className="mt-3 w-full py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:border-[#002F34] transition-colors"
      >
       Manage Billing
      </button>
     </div>
    </div>
   </div>
  </LandlordLayout>
 );
};

export default LandlordDashboard;
