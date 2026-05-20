import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
 ChevronLeft,
 Upload,
 MapPin,
 Bed,
 Bath,
 Maximize,
 CheckCircle,
} from "lucide-react";
import api from "../../utils/axios";
import PublicLayout from "../../components/PublicLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useToast } from "../../hooks/useToast";
import { formatPrice, PROPERTY_TYPE_COLORS } from "../../utils/helpers";

const DP_PERCENT = 0.1;

const CheckoutPage = () => {
 const { propertyId } = useParams();
 const navigate = useNavigate();
 const toast = useToast();

 const [property, setProperty] = useState(null);
 const [landlord, setLandlord] = useState(null);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [proofFile, setProofFile] = useState(null);
 const [proofPreview, setProofPreview] = useState("");
 const [success, setSuccess] = useState(false);

 useEffect(() => {
  api
   .get(`/properties/${propertyId}`)
   .then(({ data }) => {
    if (data.status !== "available") {
     toast({ message: "This property is no longer available", type: "error" });
     navigate("/properties");
     return;
    }
    setProperty(data);
    setLandlord(data.landlordId);
   })
   .catch(() => navigate("/properties"))
   .finally(() => setLoading(false));
 }, [propertyId, toast, navigate]);

 const dpAmount = property ? Math.round(property.price * DP_PERCENT) : 0;

 const handleProofChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
   toast({ message: "File too large. Max 5MB.", type: "error" });
   return;
  }
  setProofFile(file);
  setProofPreview(URL.createObjectURL(file));
 };

 const handleSubmit = async () => {
  if (!proofFile)
   return toast({ message: "Please upload proof of payment", type: "error" });
  setSubmitting(true);
  try {
   const fd = new FormData();
   fd.append("amount", dpAmount);
   fd.append("proof", proofFile);
   await api.post(`/transactions/booking/${propertyId}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
   });
   setSuccess(true);
  } catch (err) {
   toast({
    message: err.response?.data?.message || "Booking failed",
    type: "error",
   });
  } finally {
   setSubmitting(false);
  }
 };

 if (loading)
  return (
   <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
   </div>
  );

 if (success)
  return (
   <PublicLayout>
    <div className="max-w-md mx-auto px-4 py-20 text-center">
     <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
      <CheckCircle size={32} className="text-green-500" />
     </div>
     <h1 className="text-2xl font-bold text-gray-900 mb-2">
      Booking Submitted!
     </h1>
     <p className="text-gray-500 text-sm mb-6">
      Your payment proof has been sent to the landlord. You'll be notified once
      they confirm the payment.
     </p>
     <div className="flex gap-3 justify-center">
      <button
       onClick={() => navigate("/my-bookings")}
       className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
       style={{ backgroundColor: "#002F34" }}
      >
       View My Bookings
      </button>
      <button
       onClick={() => navigate("/properties")}
       className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700"
      >
       Browse More
      </button>
     </div>
    </div>
   </PublicLayout>
  );

 const typeColor =
  PROPERTY_TYPE_COLORS[property?.propertyType] || "bg-blue-500";

 return (
  <PublicLayout>
   <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <button
     onClick={() => navigate(-1)}
     className="flex items-center gap-2 text-gray-500 hover:text-[#002F34] mb-6 transition-colors text-sm font-medium"
    >
     <ChevronLeft size={18} /> Back to Property
    </button>

    <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
     <div className="lg:col-span-3 space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
       <h2 className="font-semibold text-gray-900 mb-4">
        Payment Instructions
       </h2>
       <div className="bg-[#EBEEEF] rounded-xl p-4 text-sm space-y-2">
        <p className="text-gray-600">Transfer the down payment (10%) to:</p>
        <div className="pt-1 space-y-1">
         <p className="text-gray-600">
          Bank:{" "}
          <span className="font-medium text-gray-800">
           {landlord?.name}'s Account
          </span>
         </p>
         <p className="text-gray-600">
          Contact:{" "}
          <span className="font-medium text-gray-800">
           {landlord?.contactNumber || landlord?.email}
          </span>
         </p>
         <div className="pt-2 border-t border-gray-200">
          <p className="text-lg font-bold text-[#002F34]">
           Amount: ${dpAmount.toLocaleString()}
           <span className="text-xs font-normal text-gray-500 ml-1">
            (10% down payment)
           </span>
          </p>
         </div>
        </div>
       </div>
       <p className="text-xs text-gray-400 mt-3">
        After transferring, upload your receipt below. The landlord will confirm
        the payment.
       </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
       <h2 className="font-semibold text-gray-900 mb-3">
        Upload Payment Proof
       </h2>
       <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#002F34] transition-colors">
        <input
         type="file"
         accept="image/*"
         onChange={handleProofChange}
         className="hidden"
        />
        {proofPreview ? (
         <img
          src={proofPreview}
          alt="proof"
          className="max-h-48 mx-auto rounded-xl object-contain"
         />
        ) : (
         <>
          <Upload size={28} className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">
           Click to upload receipt
          </p>
          <p className="text-xs text-gray-400 mt-1">JPG or PNG · Max 5MB</p>
         </>
        )}
       </label>
       {proofPreview && (
        <button
         onClick={() => {
          setProofFile(null);
          setProofPreview("");
         }}
         className="mt-2 text-xs text-red-500 hover:underline"
        >
         Remove and re-upload
        </button>
       )}
      </div>

      <button
       onClick={handleSubmit}
       disabled={submitting || !proofFile}
       className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
       style={{ backgroundColor: "#002F34" }}
      >
       {submitting ? <LoadingSpinner size="sm" /> : "Confirm Booking"}
      </button>
     </div>

     <div className="lg:col-span-2">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden sticky top-20">
       <img
        src={
         property?.images?.[0] ||
         "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600"
        }
        alt=""
        className="w-full h-40 object-cover"
       />
       <div className="p-4">
        <span
         className={`${typeColor} text-white text-xs px-2 py-0.5 rounded-md font-medium`}
        >
         {property?.propertyType}
        </span>
        <h3 className="font-semibold text-gray-900 mt-2 leading-tight">
         {property?.title}
        </h3>
        <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
         <MapPin size={11} /> {property?.city}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 mt-3">
         <span className="flex items-center gap-1">
          <Bed size={12} />{" "}
          {property?.bedrooms === 0 ? "Studio" : `${property?.bedrooms}B`}
         </span>
         <span className="flex items-center gap-1">
          <Bath size={12} /> {property?.bathrooms}B
         </span>
         <span className="flex items-center gap-1">
          <Maximize size={12} /> {property?.buildingArea}m²
         </span>
        </div>

        <hr className="my-3 border-gray-100" />

        <div className="space-y-2 text-sm">
         <div className="flex justify-between text-gray-600">
          <span>Listing price</span>
          <span>{formatPrice(property?.price, property?.propertyAdType)}</span>
         </div>
         <div className="flex justify-between font-bold text-gray-900">
          <span>Down payment (10%)</span>
          <span>${dpAmount.toLocaleString()}</span>
         </div>
        </div>

        <p className="text-xs text-gray-400 mt-3">
         Remaining balance to be settled directly with the landlord.
        </p>
       </div>
      </div>
     </div>
    </div>
   </div>
  </PublicLayout>
 );
};

export default CheckoutPage;
