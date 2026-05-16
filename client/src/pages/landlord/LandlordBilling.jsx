import { useEffect, useState, useCallback } from "react";
import {
 CreditCard,
 Upload,
 CheckCircle,
 Clock,
 XCircle,
 Star,
 AlertCircle,
} from "lucide-react";
import api from "../../utils/axios";
import LandlordLayout from "./LandlordLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
// import { useToast } from "../../components/Toast";
import { useToast } from "../../hooks/useToast";
// import { useAuth } from "../../contexts/AuthContext";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../../utils/helpers";

const BANK_INFO = {
 bankName: "HouseHunt Bank",
 accountNumber: "1234-5678-9012",
 accountName: "HouseHunt Platform",
};

const LandlordBilling = () => {
 const { user } = useAuth();
 const toast = useToast();
 const [billingHistory, setBillingHistory] = useState([]);
 const [pendingProperties, setPendingProperties] = useState([]);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [proofFile, setProofFile] = useState(null);
 const [proofPreview, setProofPreview] = useState("");
 const [selectedPlan, setSelectedPlan] = useState(null);
 const [selectedPropertyId, setSelectedPropertyId] = useState("");

 const isPremium = user?.subscriptionStatus === "premium";

 const fetchData = useCallback(async () => {
  try {
   const [billingRes, pendingRes] = await Promise.all([
    api.get("/transactions/landlord/billing"),
    api.get("/properties/landlord/pending"),
   ]);
   setBillingHistory(billingRes.data);
   setPendingProperties(pendingRes.data);
  } catch {
   toast({ message: "Failed to load billing data", type: "error" });
  } finally {
   setLoading(false);
  }
 }, [toast]);

 // useEffect(() => { fetchData(); }, [fetchData]);
 useEffect(() => {
  const timer = setTimeout(() => {
   fetchData();
  }, 0);

  return () => clearTimeout(timer);
 }, [fetchData]);

 const handleProofChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setProofFile(file);
  setProofPreview(URL.createObjectURL(file));
 };

 const handleSubmitPayment = async () => {
  if (!proofFile)
   return toast({ message: "Please upload proof of payment", type: "error" });
  if (selectedPlan === "listing_fee" && !selectedPropertyId) {
   return toast({
    message: "Please select the property to activate",
    type: "error",
   });
  }

  setSubmitting(true);
  try {
   const fd = new FormData();
   fd.append("transactionType", selectedPlan);
   fd.append("amount", selectedPlan === "subscription_premium" ? 29 : 5);
   if (selectedPlan === "listing_fee")
    fd.append("propertyId", selectedPropertyId);
   fd.append("proof", proofFile);

   await api.post("/transactions", fd, {
    headers: { "Content-Type": "multipart/form-data" },
   });
   toast({
    message: "Payment submitted! Waiting for admin verification.",
    type: "success",
   });
   setProofFile(null);
   setProofPreview("");
   setSelectedPlan(null);
   setSelectedPropertyId("");
   fetchData();
  } catch (err) {
   toast({
    message: err.response?.data?.message || "Failed to submit payment",
    type: "error",
   });
  } finally {
   setSubmitting(false);
  }
 };

 const STATUS_ICON = {
  pending: <Clock size={14} className="text-yellow-500" />,
  approved: <CheckCircle size={14} className="text-green-500" />,
  rejected: <XCircle size={14} className="text-red-500" />,
 };

 return (
  <LandlordLayout>
   <div className="mb-6">
    <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
    <p className="text-gray-500 text-sm mt-0.5">
     Manage your plan and listing fees.
    </p>
   </div>

   {/* Current status banner */}
   {isPremium && (
    <div className="bg-[#002F34] rounded-2xl p-4 mb-5 flex items-center gap-3">
     <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
      <Star size={18} className="text-yellow-300 fill-yellow-300" />
     </div>
     <div>
      <p className="text-white font-semibold text-sm">
       You are on the Premium Plan
      </p>
      <p className="text-white/60 text-xs">
       {user?.recommendedPinsLeft ?? 0} recommended pins remaining this month
      </p>
     </div>
    </div>
   )}

   {/* Plan cards — hide premium option if already premium */}
   <div
    className={`grid grid-cols-1 ${!isPremium ? "lg:grid-cols-2" : ""} gap-5 mb-6`}
   >
    {/* Listing fee — always visible */}
    <div
     className={`rounded-2xl p-5 border-2 cursor-pointer transition-all ${selectedPlan === "listing_fee" ? "border-[#00A896] bg-[#00A896]/5" : "border-gray-100 bg-white hover:border-gray-200"} ${pendingProperties.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
     onClick={() =>
      pendingProperties.length > 0 &&
      setSelectedPlan(selectedPlan === "listing_fee" ? null : "listing_fee")
     }
    >
     <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
       <CreditCard size={20} className="text-teal-600" />
      </div>
      {pendingProperties.length === 0 && (
       <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
        No pending
       </span>
      )}
     </div>
     <p className="font-bold text-gray-900 text-lg">Listing Fee</p>
     <p className="text-2xl font-bold mt-1" style={{ color: "#002F34" }}>
      $5 <span className="text-sm font-normal text-gray-400">per listing</span>
     </p>
     <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
      <li className="flex items-center gap-2">
       <CheckCircle size={14} className="text-green-500 shrink-0" /> Pay once,
       publish one property
      </li>
      <li className="flex items-center gap-2">
       <CheckCircle size={14} className="text-green-500 shrink-0" /> Instant
       activation after admin approval
      </li>
     </ul>
     {pendingProperties.length === 0 && (
      <p className="mt-3 text-xs text-gray-400 flex items-center gap-1">
       <AlertCircle size={12} /> No properties waiting for payment
      </p>
     )}
    </div>

    {/* Premium — only show if NOT already premium */}
    {!isPremium && (
     <div
      className={`rounded-2xl p-5 border-2 cursor-pointer transition-all ${selectedPlan === "subscription_premium" ? "border-[#3A77FF] bg-[#3A77FF]/5" : "border-gray-100 bg-white hover:border-gray-200"}`}
      onClick={() =>
       setSelectedPlan(
        selectedPlan === "subscription_premium" ? null : "subscription_premium",
       )
      }
     >
      <div className="flex items-start justify-between mb-3">
       <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
        <Star size={20} className="text-purple-600" />
       </div>
      </div>
      <p className="font-bold text-gray-900 text-lg">Premium Plan</p>
      <p className="text-2xl font-bold mt-1" style={{ color: "#002F34" }}>
       $29 <span className="text-sm font-normal text-gray-400">/month</span>
      </p>
      <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
       <li className="flex items-center gap-2">
        <CheckCircle size={14} className="text-green-500 shrink-0" /> Unlimited
        property listings
       </li>
       <li className="flex items-center gap-2">
        <CheckCircle size={14} className="text-green-500 shrink-0" /> 3
        Recommended pins per month
       </li>
       <li className="flex items-center gap-2">
        <CheckCircle size={14} className="text-green-500 shrink-0" /> Priority
        support
       </li>
      </ul>
     </div>
    )}
   </div>

   {/* Payment form */}
   {selectedPlan && (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
     <h2 className="font-semibold text-gray-900 mb-4">
      Submit Payment —{" "}
      {selectedPlan === "subscription_premium"
       ? "Premium ($29/mo)"
       : "Listing Fee ($5)"}
     </h2>

     {/* Bank details */}
     <div className="bg-[#EBEEEF] rounded-xl p-4 mb-4 text-sm">
      <p className="font-semibold text-gray-700 mb-2">Transfer to:</p>
      <div className="space-y-1 text-gray-600">
       <p>
        Bank:{" "}
        <span className="font-medium text-gray-800">{BANK_INFO.bankName}</span>
       </p>
       <p>
        Account No:{" "}
        <span className="font-bold text-[#002F34] text-base tracking-wider">
         {BANK_INFO.accountNumber}
        </span>
       </p>
       <p>
        Name:{" "}
        <span className="font-medium text-gray-800">
         {BANK_INFO.accountName}
        </span>
       </p>
       <p className="font-bold text-gray-800 mt-2">
        Amount: ${selectedPlan === "subscription_premium" ? 29 : 5}
       </p>
      </div>
     </div>

     {/* Property dropdown for listing fee */}
     {selectedPlan === "listing_fee" && (
      <div className="mb-4">
       <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Which property to activate?
       </label>
       <select
        value={selectedPropertyId}
        onChange={(e) => setSelectedPropertyId(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#002F34]"
       >
        <option value="">Select a property...</option>
        {pendingProperties.map((p) => (
         <option key={p._id} value={p._id}>
          {p.title} — {p.city}
         </option>
        ))}
       </select>
      </div>
     )}

     {/* Proof upload */}
     <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
       Upload Transfer Receipt
      </label>
      <label className="block border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-[#002F34] transition-colors">
       <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleProofChange}
        className="hidden"
       />
       {proofPreview ? (
        <img
         src={proofPreview}
         alt="proof"
         className="max-h-40 mx-auto rounded-lg object-contain"
        />
       ) : (
        <>
         <Upload size={24} className="mx-auto mb-2 text-gray-400" />
         <p className="text-sm text-gray-600">Click to upload receipt</p>
         <p className="text-xs text-gray-400 mt-1">JPG, PNG or PDF</p>
        </>
       )}
      </label>
     </div>

     <div className="flex gap-3">
      <button
       onClick={() => {
        setSelectedPlan(null);
        setProofFile(null);
        setProofPreview("");
        setSelectedPropertyId("");
       }}
       className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700"
      >
       Cancel
      </button>
      <button
       onClick={handleSubmitPayment}
       disabled={submitting}
       className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-70"
       style={{ backgroundColor: "#002F34" }}
      >
       {submitting ? <LoadingSpinner size="sm" /> : "Submit for Verification"}
      </button>
     </div>
    </div>
   )}

   {/* Billing history */}
   <div className="bg-white rounded-2xl border border-gray-100 p-5">
    <h2 className="font-semibold text-gray-900 mb-4">Billing History</h2>
    {loading ? (
     <div className="flex justify-center py-8">
      <LoadingSpinner />
     </div>
    ) : billingHistory.length === 0 ? (
     <p className="text-sm text-gray-400 text-center py-6">
      No billing history yet.
     </p>
    ) : (
     <div className="overflow-x-auto">
      <table className="w-full text-sm">
       <thead>
        <tr className="border-b border-gray-100 text-xs text-gray-400">
         <th className="text-left pb-3 font-medium">Type</th>
         <th className="text-left pb-3 font-medium">Property</th>
         <th className="text-left pb-3 font-medium">Amount</th>
         <th className="text-left pb-3 font-medium">Status</th>
         <th className="text-left pb-3 font-medium">Date</th>
        </tr>
       </thead>
       <tbody>
        {billingHistory.map((t) => (
         <tr key={t._id} className="border-b border-gray-50 last:border-0">
          <td className="py-3">
           <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.transactionType === "subscription_premium" ? "bg-purple-100 text-purple-700" : "bg-teal-100 text-teal-700"}`}
           >
            {t.transactionType === "subscription_premium"
             ? "Subscription"
             : "Listing Fee"}
           </span>
          </td>
          <td className="py-3 text-gray-600 max-w-[140px] truncate">
           {t.propertyId?.title || "—"}
          </td>
          <td className="py-3 font-medium">${t.amount}</td>
          <td className="py-3">
           <span className="flex items-center gap-1.5">
            {STATUS_ICON[t.status]}
            <span
             className={`text-xs capitalize ${t.status === "approved" ? "text-green-600" : t.status === "rejected" ? "text-red-600" : "text-yellow-600"}`}
            >
             {t.status}
            </span>
           </span>
          </td>
          <td className="py-3 text-gray-400 text-xs whitespace-nowrap">
           {formatDate(t.createdAt)}
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    )}
   </div>
  </LandlordLayout>
 );
};

export default LandlordBilling;
