import { useEffect, useState, useCallback } from "react";
import {
 ChevronLeft,
 BookOpen,
 ExternalLink,
 MapPin,
 Flag,
 AlertTriangle,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../utils/axios";
import PublicLayout from "../../components/PublicLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
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

const REPORT_REASONS = [
 { value: "fraud", label: "Fraud / Fake listing" },
 { value: "scam", label: "Scam attempt" },
 { value: "wrong_information", label: "Wrong or misleading information" },
 { value: "inappropriate_content", label: "Inappropriate content" },
 { value: "other", label: "Other" },
];

const MyBookingsPage = () => {
 const navigate = useNavigate();
 const toast = useToast();
 const [bookings, setBookings] = useState([]);
 const [loading, setLoading] = useState(true);
 const [proofModal, setProofModal] = useState(null);

 const [reportModal, setReportModal] = useState(null);
 const [reportForm, setReportForm] = useState({ reason: "", description: "" });
 const [reportLoading, setReportLoading] = useState(false);
 const [reportedIds, setReportedIds] = useState(new Set());
 const fetchBookings = useCallback(async () => {
  try {
   const { data } = await api.get("/transactions/tenant/bookings");
   setBookings(data);
   // check which properties have already been reported
   const approved = data.filter(
    (b) => b.status === "approved" && b.propertyId?._id,
   );
   const checks = await Promise.allSettled(
    approved.map((b) => api.get(`/reports/check/${b.propertyId._id}`)),
   );
   const alreadyReported = new Set();
   checks.forEach((result, i) => {
    if (result.status === "fulfilled" && result.value.data.hasReported) {
     alreadyReported.add(approved[i].propertyId._id);
    }
   });
   setReportedIds(alreadyReported);
  } catch {
   toast({ message: "Failed to load bookings", type: "error" });
  } finally {
   setLoading(false);
  }
 }, [toast]);

 useEffect(() => {
  const timer = setTimeout(() => {
   fetchBookings();
  }, 0);

  return () => clearTimeout(timer);
 }, [fetchBookings]);

 const handleReport = async () => {
  if (!reportForm.reason)
   return toast({ message: "Please select a reason", type: "error" });
  setReportLoading(true);
  try {
   await api.post(`/reports/${reportModal.propertyId._id}`, reportForm);
   toast({
    message: "Report submitted. Our team will review it.",
    type: "success",
   });
   setReportedIds((prev) => new Set([...prev, reportModal.propertyId._id]));
   setReportModal(null);
   setReportForm({ reason: "", description: "" });
  } catch (err) {
   toast({
    message: err.response?.data?.message || "Failed to submit report",
    type: "error",
   });
  } finally {
   setReportLoading(false);
  }
 };

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
          <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
           {property?.images?.[0] && (
            <img
             src={property.images[0]}
             alt=""
             className="w-full h-full object-cover"
            />
           )}
          </div>

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
          {booking.status === "approved" && booking.propertyId?._id && (
           <button
            onClick={() =>
             reportedIds.has(booking.propertyId._id)
              ? null
              : setReportModal(booking)
            }
            disabled={reportedIds.has(booking.propertyId._id)}
            className={`flex items-center gap-1 text-xs font-medium transition-colors ${
             reportedIds.has(booking.propertyId._id)
              ? "text-gray-400 cursor-not-allowed"
              : "text-red-500 hover:text-red-600"
            }`}
           >
            <Flag size={12} />
            {reportedIds.has(booking.propertyId._id) ? "Reported" : "Report"}
           </button>
          )}
         </div>
        </div>
       );
      })}
     </div>
    )}
   </div>

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
   {reportModal && (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
     <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
      <div className="flex items-center gap-3 mb-5">
       <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
        <AlertTriangle size={20} className="text-red-500" />
       </div>
       <div>
        <h3 className="font-bold text-gray-900">Report this property</h3>
        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
         {reportModal.propertyId?.title}
        </p>
       </div>
      </div>

      <div className="space-y-4">
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
         Reason
        </label>
        <select
         value={reportForm.reason}
         onChange={(e) =>
          setReportForm((f) => ({ ...f, reason: e.target.value }))
         }
         className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400"
        >
         <option value="">Select a reason...</option>
         {REPORT_REASONS.map(({ value, label }) => (
          <option key={value} value={value}>
           {label}
          </option>
         ))}
        </select>
       </div>
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
         Additional details <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
         value={reportForm.description}
         onChange={(e) =>
          setReportForm((f) => ({ ...f, description: e.target.value }))
         }
         placeholder="Describe the issue..."
         rows={3}
         className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400 resize-none"
        />
       </div>
      </div>

      <div className="flex gap-3 mt-5">
       <button
        onClick={() => {
         setReportModal(null);
         setReportForm({ reason: "", description: "" });
        }}
        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700"
       >
        Cancel
       </button>
       <button
        onClick={handleReport}
        disabled={reportLoading || !reportForm.reason}
        className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
       >
        {reportLoading ? (
         <LoadingSpinner size="sm" />
        ) : (
         <>
          <Flag size={14} /> Submit Report
         </>
        )}
       </button>
      </div>
     </div>
    </div>
   )}
  </PublicLayout>
 );
};

export default MyBookingsPage;
