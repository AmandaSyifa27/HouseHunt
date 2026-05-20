import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import LoadingSpinner from "../../components/LoadingSpinner";

const LoginPage = () => {
 const navigate = useNavigate();
 const location = useLocation();
 const { login } = useAuth();
 const toast = useToast();

 const [form, setForm] = useState({ email: "", password: "" });
 const [showPassword, setShowPassword] = useState(false);
 const [loading, setLoading] = useState(false);
 const [errors, setErrors] = useState({});

 const from = location.state?.from || null;

 const validate = () => {
  const e = {};
  if (!form.email) e.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
  if (!form.password) e.password = "Password is required";
  return e;
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  const errs = validate();
  if (Object.keys(errs).length) return setErrors(errs);

  setLoading(true);
  try {
   const user = await login(form.email, form.password);
   toast({
    message: `Welcome back, ${user.name.split(" ")[0]}!`,
    type: "success",
   });

   if (from) return navigate(from, { replace: true });
   if (user.role === "admin")
    return navigate("/admin/dashboard", { replace: true });
   if (user.role === "landlord")
    return navigate("/landlord/dashboard", { replace: true });
   navigate("/", { replace: true });
  } catch (err) {
   toast({
    message: err.response?.data?.message || "Login failed. Please try again.",
    type: "error",
   });
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="min-h-screen flex items-center justify-center bg-[#EBEEEF] px-4 relative overflow-hidden">
   <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-20 blur-sm">
    <div className="grid grid-cols-3 gap-4 w-full max-w-3xl px-8">
     {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl h-40" />
     ))}
    </div>
   </div>

   <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 relative z-10">
    <div className="text-center mb-6">
     <span className="text-2xl font-bold">
      <span style={{ color: "#002F34" }}>House</span>
      <span style={{ color: "#00A896" }}>Hunt</span>
     </span>
     <h1 className="text-3xl font-bold text-gray-900 mt-3">Welcome back</h1>
     <p className="text-gray-500 text-sm mt-1">
      Please enter your details to sign in.
     </p>
    </div>

    <form onSubmit={handleSubmit} className="space-y-4">
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
        onChange={(e) => {
         setForm({ ...form, email: e.target.value });
         setErrors({});
        }}
        placeholder="Enter your email"
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
        onChange={(e) => {
         setForm({ ...form, password: e.target.value });
         setErrors({});
        }}
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
      {errors.password && (
       <p className="text-xs text-red-500 mt-1">{errors.password}</p>
      )}
     </div>

     <button
      type="submit"
      disabled={loading}
      className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-70"
      style={{ backgroundColor: "#002F34" }}
     >
      {loading ? <LoadingSpinner size="sm" /> : "Sign In"}
     </button>
    </form>

    <div className="mt-6 text-center space-y-2">
     <p className="text-sm text-gray-500">
      Don't have an account?{" "}
      <Link
       to="/register"
       className="font-semibold hover:underline"
       style={{ color: "#002F34" }}
      >
       Register now
      </Link>
     </p>
     <p className="text-sm text-gray-400">
      Are you an admin?{" "}
      <span className="text-gray-400 text-xs">Use the same login above.</span>
     </p>
    </div>
   </div>
  </div>
 );
};

export default LoginPage;
