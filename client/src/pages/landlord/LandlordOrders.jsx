import { useEffect, useState, useCallback } from "react";
import {
 ClipboardList,
 ExternalLink,
 CheckCircle,
 XCircle,
} from "lucide-react";
import api from "../../utils/axios";
import LandlordLayout from "./LandlordLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useToast } from "../../hooks/useToast";
import { formatDate, formatPrice } from "../../utils/helpers";

const LandlordOrders = () => {
 const toast = useToast();
 const [orders, setOrders] = useState([]);
 const [loading, setLoading] = useState(true);
 const [proofModal, setProofModal] = useState(null);

 const fetchOrders = useCallback(async () => {
  try {
   const { data } = await api.get("/transactions/landlord/orders");
   setOrders(data);
  } catch {
   toast({ message: "Failed to load orders", type: "error" });
  } finally {
   setLoading(false);
  }
 }, [toast]);

 useEffect(() => {
  const timer = setTimeout(() => {
   fetchOrders();
  }, 0);

  return () => clearTimeout(timer);
 }, [fetchOrders]);

 const handleRespond = async (id, status) => {
  try {
   await api.put(`/transactions/landlord/orders/${id}`, { status });
   toast({
    message: `Booking ${status}`,
    type: status === "approved" ? "success" : "error",
   });
   fetchOrders();
  } catch (err) {
   toast({
    message: err.response?.data?.message || "Action failed",
    type: "error",
   });
  }
 };

 return (
  <LandlordLayout>
   <div className="mb-6">
    <h1 className="text-2xl font-bold text-gray-900">Tenant Orders</h1>
    <p className="text-gray-500 text-sm mt-0.5">
     Review and confirm booking payments from tenants.
    </p>
   </div>

   {loading ? (
    <div className="flex justify-center py-20">
     <LoadingSpinner size="lg" />
    </div>
   ) : orders.length === 0 ? (
    <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
     <ClipboardList size={40} className="mx-auto mb-3 text-gray-300" />
     <p className="font-semibold text-gray-700">No orders yet</p>
     <p className="text-sm text-gray-400 mt-1">
      Booking requests from tenants will appear here.
     </p>
    </div>
   ) : (
    <div className="space-y-4">
     {orders.map((order) => (
      <div
       key={order._id}
       className="bg-white rounded-2xl border border-gray-100 p-5"
      >
       <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="w-full sm:w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
         <img
          src={
           order.propertyId?.images?.[0] ||
           "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200"
          }
          alt=""
          className="w-full h-full object-cover"
         />
        </div>

        <div className="flex-1 min-w-0">
         <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
           <p className="font-semibold text-gray-900">
            {order.propertyId?.title}
           </p>
           <p className="text-sm text-gray-500 mt-0.5">
            Booked by{" "}
            <span className="font-medium text-gray-700">
             {order.tenantId?.name}
            </span>
            {order.tenantId?.contactNumber && (
             <span className="text-gray-400">
              {" "}
              · {order.tenantId.contactNumber}
             </span>
            )}
           </p>
          </div>
          <span
           className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${order.status === "pending" ? "bg-yellow-100 text-yellow-700" : order.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
           {order.status.toUpperCase()}
          </span>
         </div>

         <div className="flex items-center gap-4 mt-3 flex-wrap">
          <div>
           <p className="text-xs text-gray-400">Booking Amount (DP)</p>
           <p className="font-bold text-gray-900">
            ${order.amount?.toLocaleString()}
           </p>
          </div>
          <div>
           <p className="text-xs text-gray-400">Property Price</p>
           <p className="font-medium text-gray-700">
            {formatPrice(
             order.propertyId?.price,
             order.propertyId?.propertyAdType,
            )}
           </p>
          </div>
          <div>
           <p className="text-xs text-gray-400">Submitted</p>
           <p className="text-sm text-gray-600">
            {formatDate(order.createdAt)}
           </p>
          </div>
         </div>

         <div className="flex items-center gap-3 mt-4 flex-wrap">
          {order.proofOfPaymentImage && (
           <button
            onClick={() => setProofModal(order.proofOfPaymentImage)}
            className="flex items-center gap-1.5 text-xs text-[#3A77FF] font-medium hover:underline"
           >
            <ExternalLink size={13} /> View Payment Proof
           </button>
          )}

          {order.status === "pending" && (
           <div className="flex gap-2 ml-auto">
            <button
             onClick={() => handleRespond(order._id, "rejected")}
             className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
             <XCircle size={14} /> Reject
            </button>
            <button
             onClick={() => handleRespond(order._id, "approved")}
             className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors"
             style={{ backgroundColor: "#00A896" }}
            >
             <CheckCircle size={14} /> Accept Payment
            </button>
           </div>
          )}
         </div>
        </div>
       </div>
      </div>
     ))}
    </div>
   )}

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
       className="mt-3 w-full py-2 rounded-xl bg-gray-100 text-sm font-medium"
      >
       Close
      </button>
     </div>
    </div>
   )}
  </LandlordLayout>
 );
};

export default LandlordOrders;
