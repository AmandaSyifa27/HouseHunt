import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, BookOpen, ExternalLink, MapPin } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../utils/axios";
import PublicLayout from "../../components/PublicLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
// import { useToast } from "../../components/Toast";
import { useToast } from "../../hooks/useToast";
import {
 formatPrice,
 formatDate,
 PROPERTY_TYPE_COLORS,
} from "../../utils/helpers";

const STATUS_CONFIG = {
 pending: {
  label: "Waiting Confirmation",
  cls: "bg-yellow-100 text-yellow-700",
 },
 approved: { label: "Confirmed / Booked", cls: "bg-green-100 text-green-700" },
 rejected: { label: "Rejected", cls: "bg-red-100 text-red-700" },
};

const MyBookingsPage = () => {
 const navigate = useNavigate();
 const toast = useToast();
 const [bookings, setBookings] = useState([]);
 const [loading, setLoading] = useState(true);
 const [proofModal, setProofModal] = useState(null);

 const fetchBookings = useCallback(async () => {
  try {
   const { data } = await api.get("/transactions/tenant/bookings");
   setBookings(data);
  } catch {
   toast({ message: "Failed to load bookings", type: "error" });
  } finally {
   setLoading(false);
  }
 }, [toast]);

 // useEffect(() => { fetchBookings(); }, [fetchBookings]);

 useEffect(() => {
  const timer = setTimeout(() => {
   fetchBookings();
  }, 0);

  return () => clearTimeout(timer);
 }, [fetchBookings]);

 return (
  <PublicLayout>
   <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex items-center gap-3 mb-6">
     <button
      onClick={() => navigate(-1)}
      className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#002F34] hover:text-[#002F34] transition-colors shrink-0"
     >
      <ChevronLeft size={20} />
     </button>
     <div>
      <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
      <p className="text-gray-500 text-sm mt-0.5">
       Track the status of your property bookings
      </p>
     </div>
    </div>

    {loading ? (
     <div className="flex justify-center py-20">
      <LoadingSpinner size="lg" />
     </div>
    ) : bookings.length === 0 ? (
     <div className="text-center py-24">
      <div className="w-16 h-16 rounded-full bg-[#EBEEEF] flex items-center justify-center mx-auto mb-4">
       <BookOpen size={28} className="text-gray-400" />
      </div>
      <h2 className="text-lg font-semibold text-gray-700 mb-1">
       No bookings yet
      </h2>
      <p className="text-gray-400 text-sm mb-5">
       Your booking history will appear here.
      </p>
      <button
       onClick={() => navigate("/properties")}
       className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
       style={{ backgroundColor: "#002F34" }}
      >
       Browse Properties
      </button>
     </div>
    ) : (
     <div className="space-y-4">
      {bookings.map((booking) => {
       const property = booking.propertyId;
       const typeColor = property
        ? PROPERTY_TYPE_COLORS[property.propertyType]
        : "bg-gray-400";
       const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;

       return (
        <div
         key={booking._id}
         className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
         <div className="flex gap-4 p-4">
          {/* Property image */}
          <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
           {property?.images?.[0] && (
            <img
             src={property.images[0]}
             alt=""
             className="w-full h-full object-cover"
            />
           )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
           <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
             {property && (
              <span
               className={`${typeColor} text-white text-xs px-1.5 py-0.5 rounded font-medium`}
              >
               {property.propertyType}
              </span>
             )}
             <h3 className="font-semibold text-gray-900 mt-1 truncate">
              {property ? (
               <Link
                to={`/properties/${property._id}`}
                className="hover:text-[#002F34] transition-colors"
               >
                {property.title}
               </Link>
              ) : (
               "Property Unavailable"
              )}
             </h3>
             {property?.city && (
              <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
               <MapPin size={10} /> {property.city}
              </p>
             )}
            </div>
            <span
             className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${statusCfg.cls}`}
            >
             {statusCfg.label}
            </span>
           </div>

           <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
            <span>
             DP Paid:{" "}
             <span className="font-semibold text-gray-800">
              ${booking.amount?.toLocaleString()}
             </span>
            </span>
            {property && (
             <span>
              Price:{" "}
              <span className="font-medium">
               {formatPrice(property.price, property.propertyAdType)}
              </span>
             </span>
            )}
            <span>Submitted: {formatDate(booking.createdAt)}</span>
           </div>
          </div>
         </div>

         {/* Bottom action bar */}
         <div className="border-t border-gray-50 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-400">
           Landlord:{" "}
           <span className="font-medium text-gray-600 ml-1">
            {booking.landlordId?.name}
           </span>
          </div>
          {booking.proofOfPaymentImage && (
           <button
            onClick={() => setProofModal(booking.proofOfPaymentImage)}
            className="flex items-center gap-1 text-xs text-[#3A77FF] font-medium hover:underline"
           >
            <ExternalLink size={12} /> View your receipt
           </button>
          )}
         </div>
        </div>
       );
      })}
     </div>
    )}
   </div>

   {/* Proof modal */}
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
       Your Payment Receipt
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
  </PublicLayout>
 );
};

export default MyBookingsPage;
