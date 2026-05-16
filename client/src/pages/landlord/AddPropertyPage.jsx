import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const AddPropertyPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [customAmenity, setCustomAmenity] = useState("");

  const [form, setForm] = useState({
    title: "",
    propertyType: "",
    propertyAdType: "",
    price: "",
    city: "",
    fullAddress: "",
    gmapsLink: "",
    bedrooms: "",
    bathrooms: "",
    buildingArea: "",
    surfaceArea: "",
    floor: "",
    description: "",
    amenities: [],
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const toggleAmenity = (a) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));
  };

  const addCustomAmenity = () => {
    const val = customAmenity.trim();
    if (val && !form.amenities.includes(val)) {
      setForm((f) => ({ ...f, amenities: [...f.amenities, val] }));
    }
    setCustomAmenity("");
  };

  const handleImages = (e) => {
    const MAX_MB = 5;
    const allFiles = Array.from(e.target.files);
    const oversized = allFiles.filter((f) => f.size > MAX_MB * 1024 * 1024);
    if (oversized.length > 0) {
      toast({
        message: `${oversized.length} file(s) exceed ${MAX_MB}MB and were skipped: ${oversized.map((f) => f.name).join(", ")}`,
        type: "warning",
      });
    }
    const validFiles = allFiles.filter((f) => f.size <= MAX_MB * 1024 * 1024);
    const newFiles = [...imageFiles, ...validFiles].slice(0, 8);
    setImageFiles(newFiles);
    const previews = newFiles.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  const removeImage = (idx) => {
    const newFiles = imageFiles.filter((_, i) => i !== idx);
    const newPreviews = imagePreviews.filter((_, i) => i !== idx);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.propertyType) e.propertyType = "Select property type";
    if (!form.propertyAdType) e.propertyAdType = "Select ad type";
    if (!form.price || isNaN(form.price)) e.price = "Enter a valid price";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.fullAddress.trim()) e.fullAddress = "Full address is required";
    if (!form.bedrooms && form.bedrooms !== "0") e.bedrooms = "Required";
    if (!form.bathrooms) e.bathrooms = "Required";
    if (!form.buildingArea) e.buildingArea = "Required";
    if (!form.description.trim()) e.description = "Description is required";
    if (imageFiles.length === 0) e.images = "Upload at least one image";
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast({ message: "Please fix the errors below", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "amenities") fd.append(k, JSON.stringify(v));
        else if (v !== "") fd.append(k, v);
      });
      imageFiles.forEach((f) => fd.append("images", f));

      const { data } = await api.post("/properties", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.requiresPayment) {
        toast({
          message: "Property created! Complete payment to publish it.",
          type: "warning",
        });
        navigate("/landlord/billing");
      } else {
        toast({ message: "Property published successfully!", type: "success" });
        navigate("/landlord/properties");
      }
    } catch (err) {
      toast({
        message: err.response?.data?.message || "Failed to create property",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (err) =>
    `w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-colors ${
      err
        ? "border-red-400 bg-red-50"
        : "border-gray-200 focus:border-[#002F34]"
    }`;

  return (
    <LandlordLayout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Fill in the details below to list a new property on HouseHunt.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <Field label="Property Title" error={errors.title}>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Modern Apartment in Downtown"
              className={inputCls(errors.title)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Property Type" error={errors.propertyType}>
              <select
                value={form.propertyType}
                onChange={(e) => set("propertyType", e.target.value)}
                className={inputCls(errors.propertyType)}
              >
                <option value="">Select type</option>
                {["House", "Apartment", "Villa"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Property Ad Type" error={errors.propertyAdType}>
              <select
                value={form.propertyAdType}
                onChange={(e) => set("propertyAdType", e.target.value)}
                className={inputCls(errors.propertyAdType)}
              >
                <option value="">Select ad type</option>
                <option value="Rent">Rent</option>
                <option value="Sale">Sale</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label={`Price ${form.propertyAdType === "Rent" ? "($/month)" : "($)"}`}
              error={errors.price}
            >
              <input
                type="number"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="0.00"
                className={inputCls(errors.price)}
              />
            </Field>
            <Field label="City" error={errors.city}>
              <input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="e.g. Jakarta"
                className={inputCls(errors.city)}
              />
            </Field>
          </div>

          <Field label="Full Address" error={errors.fullAddress}>
            <input
              value={form.fullAddress}
              onChange={(e) => set("fullAddress", e.target.value)}
              placeholder="123 Main St, City, Country"
              className={inputCls(errors.fullAddress)}
            />
          </Field>

          <Field label="Google Maps Link (optional)">
            <input
              value={form.gmapsLink}
              onChange={(e) => set("gmapsLink", e.target.value)}
              placeholder="https://maps.google.com/..."
              className={inputCls(false)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Bedrooms (0 = Studio)" error={errors.bedrooms}>
              <input
                type="number"
                min="0"
                value={form.bedrooms}
                onChange={(e) => set("bedrooms", e.target.value)}
                placeholder="0"
                className={inputCls(errors.bedrooms)}
              />
            </Field>
            <Field label="Bathrooms" error={errors.bathrooms}>
              <input
                type="number"
                min="1"
                value={form.bathrooms}
                onChange={(e) => set("bathrooms", e.target.value)}
                placeholder="1"
                className={inputCls(errors.bathrooms)}
              />
            </Field>
            <Field label="Building Area (m²)" error={errors.buildingArea}>
              <input
                type="number"
                value={form.buildingArea}
                onChange={(e) => set("buildingArea", e.target.value)}
                placeholder="m²"
                className={inputCls(errors.buildingArea)}
              />
            </Field>
            <Field label="Surface Area (m², optional)">
              <input
                type="number"
                value={form.surfaceArea}
                onChange={(e) => set("surfaceArea", e.target.value)}
                placeholder="m²"
                className={inputCls(false)}
              />
            </Field>
          </div>

          <Field
            label={
              form.propertyType === "Apartment"
                ? "Floor (e.g. 25 → shows as 25th Floor)"
                : "Number of Floors"
            }
          >
            <input
              type="number"
              min="1"
              value={form.floor}
              onChange={(e) => set("floor", e.target.value)}
              placeholder={
                form.propertyType === "Apartment" ? "e.g. 25" : "e.g. 2"
              }
              className={inputCls(false)}
            />
          </Field>

          <Field label="Description" error={errors.description}>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the property..."
              rows={4}
              className={`${inputCls(errors.description)} resize-none`}
            />
          </Field>

          {/* Amenities */}
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
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.amenities.includes(a)
                      ? "text-white border-transparent"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                  style={
                    form.amenities.includes(a)
                      ? { backgroundColor: "#002F34" }
                      : {}
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
                  e.key === "Enter" && (e.preventDefault(), addCustomAmenity())
                }
                placeholder="Add custom amenity..."
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#002F34]"
              />
              <button
                type="button"
                onClick={addCustomAmenity}
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

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Photos
            </label>
            {errors.images && (
              <p className="text-xs text-red-500 mb-2">{errors.images}</p>
            )}
            <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#002F34] transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImages}
                className="hidden"
              />
              <Upload size={24} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">
                Click to upload images
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG or JPEG (max 5MB · up to 8 photos)
              </p>
            </label>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {imagePreviews.map((src, i) => (
                  <div
                    key={i}
                    className="relative group rounded-xl overflow-hidden aspect-square"
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={() => navigate("/landlord/properties")}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-70 transition-opacity"
            style={{ backgroundColor: "#002F34" }}
          >
            {loading ? <LoadingSpinner size="sm" /> : "Submit Property"}
          </button>
        </div>
      </div>
    </LandlordLayout>
  );
};

export default AddPropertyPage;
