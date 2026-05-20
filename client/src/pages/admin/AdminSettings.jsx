import { useState } from "react";
import { Camera, Save, Lock } from "lucide-react";
import api from "../../utils/axios";
import AdminLayout from "./AdminLayout";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getInitials } from "../../utils/helpers";

const AdminSettings = () => {
 const { user, updateUser } = useAuth();
 const toast = useToast();

 const [form, setForm] = useState({
  name: user?.name || "",
  contactNumber: user?.contactNumber || "",
 });
 const [profileImage, setProfileImage] = useState(null);
 const [previewUrl, setPreviewUrl] = useState(user?.profileImage || "");
 const [passwords, setPasswords] = useState({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
 });
 const [savingProfile, setSavingProfile] = useState(false);
 const [savingPassword, setSavingPassword] = useState(false);

 const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
   toast({ message: "Image too large. Max 2MB.", type: "error" });
   return;
  }
  setProfileImage(file);
  setPreviewUrl(URL.createObjectURL(file));
 };

 const handleSaveProfile = async () => {
  if (!form.name.trim())
   return toast({ message: "Name is required", type: "error" });
  setSavingProfile(true);
  try {
   const fd = new FormData();
   fd.append("name", form.name);
   fd.append("contactNumber", form.contactNumber);
   if (profileImage) fd.append("profileImage", profileImage);
   const { data } = await api.put("/auth/profile", fd, {
    headers: { "Content-Type": "multipart/form-data" },
   });
   updateUser(data);
   toast({ message: "Profile updated successfully", type: "success" });
  } catch (err) {
   toast({
    message: err.response?.data?.message || "Update failed",
    type: "error",
   });
  } finally {
   setSavingProfile(false);
  }
 };

 const handleChangePassword = async () => {
  if (passwords.newPassword !== passwords.confirmPassword) {
   return toast({ message: "Passwords do not match", type: "error" });
  }
  if (passwords.newPassword.length < 8) {
   return toast({
    message: "Password must be at least 8 characters",
    type: "error",
   });
  }
  setSavingPassword(true);
  try {
   await api.put("/auth/password", {
    currentPassword: passwords.currentPassword,
    newPassword: passwords.newPassword,
   });
   toast({ message: "Password changed successfully", type: "success" });
   setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
  } catch (err) {
   toast({
    message: err.response?.data?.message || "Failed to change password",
    type: "error",
   });
  } finally {
   setSavingPassword(false);
  }
 };

 const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#002F34] transition-colors";

 return (
  <AdminLayout>
   <div className="max-w-xl">
    <div className="mb-6">
     <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
     <p className="text-gray-500 text-sm mt-0.5">
      Manage your admin account details.
     </p>
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
     <h2 className="font-semibold text-gray-900 mb-5">Profile Information</h2>

     <div className="flex items-center gap-5 mb-6">
      <div className="relative">
       {previewUrl ? (
        <img
         src={previewUrl}
         alt="avatar"
         className="w-20 h-20 rounded-full object-cover"
        />
       ) : (
        <div
         className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
         style={{ backgroundColor: "#002F34" }}
        >
         {getInitials(user?.name || "")}
        </div>
       )}
       <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-sm">
        <Camera size={13} className="text-gray-600" />
        <input
         type="file"
         accept="image/*"
         className="hidden"
         onChange={handleImageChange}
        />
       </label>
      </div>
      <div>
       <p className="font-semibold text-gray-800">{user?.name}</p>
       <p className="text-sm text-gray-400">{user?.email}</p>
       <span className="text-xs px-2 py-0.5 rounded-full bg-[#002F34]/10 text-[#002F34] font-medium mt-1 inline-block">
        Super Admin
       </span>
      </div>
     </div>

     <div className="space-y-4">
      <div>
       <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Full Name
       </label>
       <input
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        className={inputCls}
       />
      </div>
      <div>
       <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Email
       </label>
       <input
        value={user?.email}
        disabled
        className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`}
       />
       <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
      </div>
      <div>
       <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Contact Number <span className="text-gray-400">(optional)</span>
       </label>
       <input
        value={form.contactNumber}
        onChange={(e) =>
         setForm((f) => ({ ...f, contactNumber: e.target.value }))
        }
        placeholder="+1..."
        className={inputCls}
       />
      </div>
     </div>

     <button
      onClick={handleSaveProfile}
      disabled={savingProfile}
      className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-70 transition-opacity"
      style={{ backgroundColor: "#002F34" }}
     >
      {savingProfile ? (
       <LoadingSpinner size="sm" />
      ) : (
       <>
        <Save size={15} /> Save Changes
       </>
      )}
     </button>
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 p-6">
     <div className="flex items-center gap-2 mb-5">
      <Lock size={18} className="text-gray-500" />
      <h2 className="font-semibold text-gray-900">Change Password</h2>
     </div>

     <div className="space-y-4">
      {[
       { label: "Current Password", key: "currentPassword" },
       { label: "New Password", key: "newPassword" },
       { label: "Confirm New Password", key: "confirmPassword" },
      ].map(({ label, key }) => (
       <div key={key}>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
         {label}
        </label>
        <input
         type="password"
         value={passwords[key]}
         onChange={(e) =>
          setPasswords((p) => ({ ...p, [key]: e.target.value }))
         }
         placeholder="••••••••"
         className={inputCls}
        />
       </div>
      ))}
     </div>

     <button
      onClick={handleChangePassword}
      disabled={savingPassword}
      className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-70 transition-opacity"
      style={{ backgroundColor: "#002F34" }}
     >
      {savingPassword ? <LoadingSpinner size="sm" /> : "Update Password"}
     </button>
    </div>
   </div>
  </AdminLayout>
 );
};

export default AdminSettings;
