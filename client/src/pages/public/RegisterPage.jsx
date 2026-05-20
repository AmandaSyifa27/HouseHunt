import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Search, Home } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import LoadingSpinner from "../../components/LoadingSpinner";

const BG_IMAGE =
 "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80";

const RegisterPage = () => {
 const navigate = useNavigate();
 const { register } = useAuth();
 const toast = useToast();

 const [form, setForm] = useState({
  name: "",
  email: "",
  password: "",
  role: "tenant",
 });
 const [showPassword, setShowPassword] = useState(false);
 const [loading, setLoading] = useState(false);
 const [errors, setErrors] = useState({});

 const validate = () => {
  const e = {};
  if (!form.name.trim()) e.name = "Full name is required";
  if (!form.email) e.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
  if (!form.password) e.password = "Password is required";
  else if (form.password.length < 8)
   e.password = "Must be at least 8 characters";
  return e;
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  const errs = validate();
  if (Object.keys(errs).length) return setErrors(errs);

  setLoading(true);
  try {
   const user = await register(form);
   toast({
    message: `Account created! Welcome, ${user.name.split(" ")[0]}!`,
    type: "success",
   });
   if (user.role === "landlord")
    navigate("/landlord/dashboard", { replace: true });
   else navigate("/", { replace: true });
  } catch (err) {
   toast({
    message: err.response?.data?.message || "Registration failed.",
    type: "error",
   });
  } finally {
   setLoading(false);
  }
 };

 const set = (key, val) => {
  setForm((f) => ({ ...f, [key]: val }));
  setErrors({});
 };

 return (
  <div className="min-h-screen flex">
   <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
    <img
     src={BG_IMAGE}
     alt="Property"
     className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-linear-to-t from-[#002F34]/80 via-[#002F34]/30 to-transparent" />
    <div className="relative z-10 flex flex-col justify-end p-12 text-white">
     <div className="mb-4">
      <span className="text-3xl font-bold">
       <span className="text-white">House</span>
       <span style={{ color: "#00A896" }}>Hunt</span>
      </span>
     </div>
     <h2 className="text-4xl font-bold leading-tight mb-3">
      Find your place
      <br />
      in the world.
     </h2>
     <p className="text-white/70 text-base leading-relaxed max-w-sm">
      Join our premium marketplace to discover curated homes or connect with
      high-quality tenants seamlessly.
     </p>
    </div>
   </div>

   <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
    <div className="w-full max-w-md">
     <div className="lg:hidden mb-8 text-center">
      <span className="text-2xl font-bold">
       <span style={{ color: "#002F34" }}>House</span>
       <span style={{ color: "#00A896" }}>Hunt</span>
      </span>
     </div>

     <h1 className="text-3xl font-bold text-gray-900 mb-1">
      Create an account
     </h1>
     <p className="text-gray-500 text-sm mb-7">
      Enter your details below to get started.
     </p>

     <div className="mb-6">
      <p className="text-sm font-medium text-gray-700 mb-3">
       I am looking to...
      </p>
      <div className="grid grid-cols-2 gap-3">
       {[
        { value: "tenant", label: "Find a Home", Icon: Search },
        { value: "landlord", label: "List Property", Icon: Home },
       ].map(({ value, label, Icon }) => (
        <button
         key={value}
         type="button"
         onClick={() => set("role", value)}
         className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 text-sm font-medium transition-all ${
          form.role === value
           ? "border-[#002F34] bg-[#002F34]/5 text-[#002F34]"
           : "border-gray-200 text-gray-500 hover:border-gray-300"
         }`}
        >
         <Icon size={22} />
         {label}
        </button>
       ))}
      </div>
     </div>

     <form onSubmit={handleSubmit} className="space-y-4">
      <div>
       <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Full Name
       </label>
       <div className="relative">
        <User
         size={16}
         className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
         type="text"
         value={form.name}
         onChange={(e) => set("name", e.target.value)}
         placeholder="Jane Doe"
         className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors ${errors.name ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-[#002F34]"}`}
        />
       </div>
       {errors.name && (
        <p className="text-xs text-red-500 mt-1">{errors.name}</p>
       )}
      </div>

      <div>
       <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Email address
       </label>
       <div className="relative">
        <Mail
         size={16}
         className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
         type="email"
         value={form.email}
         onChange={(e) => set("email", e.target.value)}
         placeholder="jane@example.com"
         className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-[#002F34]"}`}
        />
       </div>
       {errors.email && (
        <p className="text-xs text-red-500 mt-1">{errors.email}</p>
       )}
      </div>

      <div>
       <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Password
       </label>
       <div className="relative">
        <Lock
         size={16}
         className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
         type={showPassword ? "text" : "password"}
         value={form.password}
         onChange={(e) => set("password", e.target.value)}
         placeholder="••••••••"
         className={`w-full pl-9 pr-10 py-3 rounded-xl border text-sm outline-none transition-colors ${errors.password ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-[#002F34]"}`}
        />
        <button
         type="button"
         onClick={() => setShowPassword(!showPassword)}
         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
         {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
       </div>
       {errors.password ? (
        <p className="text-xs text-red-500 mt-1">{errors.password}</p>
       ) : (
        <p className="text-xs text-gray-400 mt-1">
         Must be at least 8 characters.
        </p>
       )}
      </div>

      <button
       type="submit"
       disabled={loading}
       className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-70 transition-opacity mt-2"
       style={{ backgroundColor: "#002F34" }}
      >
       {loading ? <LoadingSpinner size="sm" /> : "Create Account"}
      </button>
     </form>

     <p className="text-center text-sm text-gray-500 mt-6">
      Already have an account?{" "}
      <Link
       to="/login"
       className="font-semibold hover:underline"
       style={{ color: "#002F34" }}
      >
       Log In
      </Link>
     </p>
    </div>
   </div>
  </div>
 );
};

export default RegisterPage;
