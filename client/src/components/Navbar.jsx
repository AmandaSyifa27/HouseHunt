import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getInitials } from "../utils/helpers";
import { useState, useRef, useEffect } from "react";
import {
 ChevronDown,
 User,
 Heart,
 BookOpen,
 LogOut,
 LayoutDashboard,
} from "lucide-react";

const Navbar = () => {
 const { user, logout } = useAuth();
 const navigate = useNavigate();
 const [dropdownOpen, setDropdownOpen] = useState(false);
 const dropdownRef = useRef(null);

 useEffect(() => {
  const handler = (e) => {
   if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
    setDropdownOpen(false);
   }
  };
  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
 }, []);

 const handleLogout = () => {
  logout();
  navigate("/");
  setDropdownOpen(false);
 };

 const getDashboardLink = () => {
  if (user?.role === "admin") return "/admin/dashboard";
  if (user?.role === "landlord") return "/landlord/dashboard";
  return "/";
 };

 return (
  <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    {/* Logo */}
    <Link to="/" className="flex items-center">
     <span className="text-2xl font-bold">
      <span style={{ color: "#002F34" }}>House</span>
      <span style={{ color: "#00A896" }}>Hunt</span>
     </span>
    </Link>

    {/* Right side */}
    {user ? (
     <div className="relative" ref={dropdownRef}>
      <button
       onClick={() => setDropdownOpen(!dropdownOpen)}
       className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
       {user.profileImage ? (
        <img
         src={user.profileImage}
         alt={user.name}
         className="w-9 h-9 rounded-full object-cover"
        />
       ) : (
        <div
         className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
         style={{ backgroundColor: "#002F34" }}
        >
         {getInitials(user.name)}
        </div>
       )}
       <span className="text-sm font-medium text-gray-700 hidden sm:block">
        {user.name.split(" ")[0]} {user.name.split(" ")[1]?.[0]}.
       </span>
       <ChevronDown size={14} className="text-gray-500" />
      </button>

      {dropdownOpen && (
       <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
        <Link
         to={getDashboardLink()}
         onClick={() => setDropdownOpen(false)}
         className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
        >
         <LayoutDashboard size={16} />
         Dashboard
        </Link>
        {user.role === "tenant" && (
         <>
          <Link
           to="/favorites"
           onClick={() => setDropdownOpen(false)}
           className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
           <Heart size={16} />
           My Favorites
          </Link>
          <Link
           to="/my-bookings"
           onClick={() => setDropdownOpen(false)}
           className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
           <BookOpen size={16} />
           My Bookings
          </Link>
         </>
        )}
        <Link
         to="/profile"
         onClick={() => setDropdownOpen(false)}
         className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
        >
         <User size={16} />
         Profile
        </Link>
        <hr className="my-1 border-gray-100" />
        <button
         onClick={handleLogout}
         className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
        >
         <LogOut size={16} />
         Log Out
        </button>
       </div>
      )}
     </div>
    ) : (
     <div className="flex items-center gap-3">
      <Link
       to="/login"
       className="text-sm font-medium text-gray-700 hover:text-[#002F34] transition-colors"
      >
       Sign In
      </Link>
      <Link
       to="/register"
       className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
       style={{ backgroundColor: "#002F34" }}
       onMouseEnter={(e) => (e.target.style.backgroundColor = "#004d54")}
       onMouseLeave={(e) => (e.target.style.backgroundColor = "#002F34")}
      >
       Sign Up
      </Link>
     </div>
    )}
   </div>
  </nav>
 );
};

export default Navbar;
