import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, Plus } from "lucide-react";
import api from "../../utils/axios";
import LandlordLayout from "./LandlordLayout";
import { useToast } from "../../hooks/useToast";
import LoadingSpinner from "../../components/LoadingSpinner";

const PRESET_AMENITIES = [
 "WiFi",
 "Parking",
 "Pool",
 "Gym",
 "Air Conditioning",
 "Security",
];
const Field = ({ label, children }) => (
 <div>
  <label className="block text-sm font-medium text-gray-700 mb-1.5">
   {label}
  </label>
  {children}
 </div>
);

const EditPropertyPage = () => {
 const { id } = useParams();
 const navigate = useNavigate();
 const toast = useToast();
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [newImageFiles, setNewImageFiles] = useState([]);
 const [newImagePreviews, setNewImagePreviews] = useState([]);
 const [existingImages, setExistingImages] = useState([]);
 const [customAmenity, setCustomAmenity] = useState("");
 const [form, setForm] = useState(null);

 useEffect(() => {
  api
   .get(`/properties/${id}`)
   .then(({ data }) => {
    setForm({
     title: data.title || "",
     propertyType: data.propertyType || "",
     propertyAdType: data.propertyAdType || "",
     price: data.price || "",
     city: data.city || "",
     fullAddress: data.fullAddress || "",
     gmapsLink: data.gmapsLink || "",
     bedrooms: data.bedrooms ?? "",
     bathrooms: data.bathrooms || "",
     buildingArea: data.buildingArea || "",
     surfaceArea: data.surfaceArea || "",
     floor: data.floor || "",
     description: data.description || "",
     amenities: data.amenities || [],
    });
    setExistingImages(data.images || []);
   })
   .catch(() => {
    toast({ message: "Property not found", type: "error" });
    navigate("/landlord/properties");
   })
   .finally(() => setLoading(false));
 }, [id, navigate, toast]);
 // }, [id]);

 if (loading || !form)
  return (
   <LandlordLayout>
    <div className="flex justify-center py-20">
     <LoadingSpinner size="lg" />
    </div>
   </LandlordLayout>
  );

 const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
 const toggleAmenity = (a) =>
  setForm((f) => ({
   ...f,
   amenities: f.amenities.includes(a)
    ? f.amenities.filter((x) => x !== a)
    : [...f.amenities, a],
  }));
 const addCustom = () => {
  const v = customAmenity.trim();
  if (v && !form.amenities.includes(v))
   setForm((f) => ({ ...f, amenities: [...f.amenities, v] }));
  setCustomAmenity("");
 };

 const handleNewImages = (e) => {
  const files = Array.from(e.target.files).slice(0, 8 - existingImages.length);
  setNewImageFiles((prev) => [...prev, ...files]);
  setNewImagePreviews((prev) => [
   ...prev,
   ...files.map((f) => URL.createObjectURL(f)),
  ]);
 };

 const handleSubmit = async () => {
  setSaving(true);
  try {
   const fd = new FormData();
   Object.entries(form).forEach(([k, v]) => {
    if (k === "amenities") fd.append(k, JSON.stringify(v));
    else if (v !== "") fd.append(k, v);
   });
   existingImages.forEach((url) => fd.append("existingImages", url));
   newImageFiles.forEach((f) => fd.append("images", f));
   await api.put(`/properties/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
   });
   toast({ message: "Property updated!", type: "success" });
   navigate("/landlord/properties");
  } catch (err) {
   toast({
    message: err.response?.data?.message || "Update failed",
    type: "error",
   });
  } finally {
   setSaving(false);
  }
 };

 const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#002F34] transition-colors";

 return (
  <LandlordLayout>
   <div className="max-w-2xl">
    <div className="mb-6">
     <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
     <p className="text-gray-500 text-sm mt-0.5">
      Update your listing details.
     </p>
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
     <Field label="Property Title">
      <input
       value={form.title}
       onChange={(e) => set("title", e.target.value)}
       className={inputCls}
      />
     </Field>
     <div className="grid grid-cols-2 gap-4">
      <Field label="Property Type">
       <select
        value={form.propertyType}
        onChange={(e) => set("propertyType", e.target.value)}
        className={inputCls}
       >
        {["House", "Apartment", "Villa"].map((t) => (
         <option key={t}>{t}</option>
        ))}
       </select>
      </Field>
      <Field label="Ad Type">
       <select
        value={form.propertyAdType}
        onChange={(e) => set("propertyAdType", e.target.value)}
        className={inputCls}
       >
        <option value="Rent">Rent</option>
        <option value="Sale">Sale</option>
       </select>
      </Field>
     </div>
     <div className="grid grid-cols-2 gap-4">
      <Field label="Price ($)">
       <input
        type="number"
        value={form.price}
        onChange={(e) => set("price", e.target.value)}
        className={inputCls}
       />
      </Field>
      <Field label="City">
       <input
        value={form.city}
        onChange={(e) => set("city", e.target.value)}
        className={inputCls}
       />
      </Field>
     </div>
     <Field label="Full Address">
      <input
       value={form.fullAddress}
       onChange={(e) => set("fullAddress", e.target.value)}
       className={inputCls}
      />
     </Field>
     <Field label="Google Maps Link (optional)">
      <input
       value={form.gmapsLink}
       onChange={(e) => set("gmapsLink", e.target.value)}
       className={inputCls}
      />
     </Field>
     <div className="grid grid-cols-2 gap-4">
      <Field label="Bedrooms (0=Studio)">
       <input
        type="number"
        min="0"
        value={form.bedrooms}
        onChange={(e) => set("bedrooms", e.target.value)}
        className={inputCls}
       />
      </Field>
      <Field label="Bathrooms">
       <input
        type="number"
        min="1"
        value={form.bathrooms}
        onChange={(e) => set("bathrooms", e.target.value)}
        className={inputCls}
       />
      </Field>
      <Field label="Building Area (m²)">
       <input
        type="number"
        value={form.buildingArea}
        onChange={(e) => set("buildingArea", e.target.value)}
        className={inputCls}
       />
      </Field>
      <Field label="Surface Area (optional)">
       <input
        type="number"
        value={form.surfaceArea}
        onChange={(e) => set("surfaceArea", e.target.value)}
        className={inputCls}
       />
      </Field>
     </div>
     <Field
      label={form.propertyType === "Apartment" ? "Floor" : "Number of Floors"}
     >
      <input
       type="number"
       min="1"
       value={form.floor}
       onChange={(e) => set("floor", e.target.value)}
       className={inputCls}
      />
     </Field>
     <Field label="Description">
      <textarea
       value={form.description}
       onChange={(e) => set("description", e.target.value)}
       rows={4}
       className={`${inputCls} resize-none`}
      />
     </Field>

     <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
       Amenities
      </label>
      <div className="flex flex-wrap gap-2 mb-3">
       {PRESET_AMENITIES.map((a) => (
        <button
         key={a}
         type="button"
         onClick={() => toggleAmenity(a)}
         className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.amenities.includes(a) ? "text-white border-transparent" : "border-gray-200 text-gray-600"}`}
         style={
          form.amenities.includes(a) ? { backgroundColor: "#002F34" } : {}
         }
        >
         {a}
        </button>
       ))}
      </div>
      <div className="flex gap-2">
       <input
        value={customAmenity}
        onChange={(e) => setCustomAmenity(e.target.value)}
        onKeyDown={(e) =>
         e.key === "Enter" && (e.preventDefault(), addCustom())
        }
        placeholder="Add custom..."
        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#002F34]"
       />
       <button
        type="button"
        onClick={addCustom}
        className="px-3 py-2 rounded-xl text-white text-xs"
        style={{ backgroundColor: "#002F34" }}
       >
        <Plus size={14} />
       </button>
      </div>
      {form.amenities.length > 0 && (
       <div className="flex flex-wrap gap-1.5 mt-2">
        {form.amenities.map((a) => (
         <span
          key={a}
          className="flex items-center gap-1 bg-[#002F34]/10 text-[#002F34] text-xs px-2 py-1 rounded-full"
         >
          {a}
          <button onClick={() => toggleAmenity(a)}>
           <X size={10} />
          </button>
         </span>
        ))}
       </div>
      )}
     </div>

     <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
       Photos
      </label>
      {existingImages.length > 0 && (
       <div className="grid grid-cols-4 gap-2 mb-3">
        {existingImages.map((src, i) => (
         <div
          key={i}
          className="relative group rounded-xl overflow-hidden aspect-square"
         >
          <img src={src} alt="" className="w-full h-full object-cover" />
          <button
           onClick={() =>
            setExistingImages((imgs) => imgs.filter((_, idx) => idx !== i))
           }
           className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
           <X size={10} className="text-white" />
          </button>
         </div>
        ))}
        {newImagePreviews.map((src, i) => (
         <div
          key={`new-${i}`}
          className="relative group rounded-xl overflow-hidden aspect-square"
         >
          <img src={src} alt="" className="w-full h-full object-cover" />
          <button
           onClick={() => {
            setNewImageFiles((f) => f.filter((_, idx) => idx !== i));
            setNewImagePreviews((p) => p.filter((_, idx) => idx !== i));
           }}
           className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
           <X size={10} className="text-white" />
          </button>
         </div>
        ))}
       </div>
      )}
      {existingImages.length + newImageFiles.length < 8 && (
       <label className="block border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#002F34] transition-colors">
        <input
         type="file"
         multiple
         accept="image/*"
         onChange={handleNewImages}
         className="hidden"
        />
        <Upload size={20} className="mx-auto mb-1 text-gray-400" />
        <p className="text-xs text-gray-500">Add more photos</p>
       </label>
      )}
     </div>
    </div>

    <div className="flex justify-end gap-3 mt-5">
     <button
      onClick={() => navigate("/landlord/properties")}
      className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700"
     >
      Cancel
     </button>
     <button
      onClick={handleSubmit}
      disabled={saving}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-70"
      style={{ backgroundColor: "#002F34" }}
     >
      {saving ? <LoadingSpinner size="sm" /> : "Save Changes"}
     </button>
    </div>
   </div>
  </LandlordLayout>
 );
};

export default EditPropertyPage;
