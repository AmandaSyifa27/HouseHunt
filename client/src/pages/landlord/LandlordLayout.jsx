import { NavLink, useNavigate } from "react-router-dom";
import {
 LayoutDashboard,
 Building2,
 PackagePlus,
 ClipboardList,
 CreditCard,
 User,
 LogOut,
 Menu,
 X,
 Star,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getInitials } from "../../utils/helpers";

const NAV_ITEMS = [
 { to: "/landlord/dashboard", Icon: LayoutDashboard, label: "Dashboard" },
 { to: "/landlord/properties", Icon: Building2, label: "Properties" },
 { to: "/landlord/orders", Icon: ClipboardList, label: "Tenant Orders" },
 { to: "/landlord/billing", Icon: CreditCard, label: "Billing" },
 { to: "/landlord/profile", Icon: User, label: "Profile" },
];

const SidebarContent = ({
 user,
 isPremium,
 setMobileOpen,
 navigate,
 handleLogout,
}) => (
 <div className="flex flex-col h-full">
  {/* Logo */}
  <div className="px-5 py-5 border-b border-white/10">
   <span className="text-xl font-bold text-white">
    House<span style={{ color: "#00A896" }}>Hunt</span>
   </span>
  </div>

  {/* User info */}
  <div className="px-4 py-4 border-b border-white/10">
   <div className="flex items-center gap-3">
    {user?.profileImage ? (
     <img
      src={user.profileImage}
      alt=""
      className="w-10 h-10 rounded-full object-cover shrink-0"
     />
    ) : (
     <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 bg-white/20">
      {getInitials(user?.name || "")}
     </div>
    )}
    <div className="min-w-0">
     <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
     <div className="flex items-center gap-1 mt-0.5">
      {isPremium ? (
       <span className="flex items-center gap-1 text-xs text-yellow-300 font-medium">
        <Star size={10} className="fill-yellow-300" /> Premium Member
       </span>
      ) : (
       <span className="text-xs text-white/50">Free Member</span>
      )}
     </div>
    </div>
   </div>
  </div>

  {/* Nav */}
  <nav className="flex-1 px-3 py-4 space-y-1">
   {NAV_ITEMS.map(({ to, Icon, label }) => (
    <NavLink
     key={to}
     to={to}
     onClick={() => setMobileOpen(false)}
     className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
       isActive
        ? "bg-white/15 text-white"
        : "text-white/60 hover:bg-white/10 hover:text-white"
      }`
     }
    >
     <Icon size={18} />
     {label}
    </NavLink>
   ))}
  </nav>

  {/* Post new property CTA */}
  <div className="px-4 pb-3">
   <button
    onClick={() => {
     navigate("/landlord/properties/add");
     setMobileOpen(false);
    }}
    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/30 hover:bg-white/10 transition-colors"
   >
    <PackagePlus size={16} /> New Listing
   </button>
  </div>

  {/* Logout */}
  <div className="px-3 pb-4 border-t border-white/10 pt-3">
   <button
    onClick={handleLogout}
    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
   >
    <LogOut size={18} /> Log Out
   </button>
  </div>
 </div>
);

const LandlordLayout = ({ children }) => {
 const { user, logout } = useAuth();
 const navigate = useNavigate();
 const [mobileOpen, setMobileOpen] = useState(false);

 const handleLogout = () => {
  logout();
  navigate("/");
 };

 const isPremium = user?.subscriptionStatus === "premium";

 return (
  <div className="flex h-screen bg-[#EBEEEF] overflow-hidden">
   {/* Desktop sidebar */}
   <aside
    className="hidden lg:flex flex-col w-52 shrink-0"
    style={{ backgroundColor: "#002F34" }}
   >
    <SidebarContent
     user={user}
     isPremium={isPremium}
     setMobileOpen={setMobileOpen}
     navigate={navigate}
     handleLogout={handleLogout}
    />
   </aside>

   {/* Mobile sidebar */}
   {mobileOpen && (
    <div className="fixed inset-0 z-50 lg:hidden">
     <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setMobileOpen(false)}
     />
     <aside
      className="relative w-64 h-full flex flex-col"
      style={{ backgroundColor: "#002F34" }}
     >
      <button
       className="absolute top-4 right-4 text-white/60"
       onClick={() => setMobileOpen(false)}
      >
       <X size={20} />
      </button>
      <SidebarContent
       user={user}
       isPremium={isPremium}
       setMobileOpen={setMobileOpen}
       navigate={navigate}
       handleLogout={handleLogout}
      />
     </aside>
    </div>
   )}

   {/* Main content */}
   <div className="flex-1 flex flex-col overflow-hidden">
    <header className="bg-white border-b border-gray-100 h-14 flex items-center justify-between px-5 shrink-0 lg:hidden">
     <button onClick={() => setMobileOpen(true)}>
      <Menu size={20} className="text-gray-600" />
     </button>
     <span className="font-bold text-base">
      <span style={{ color: "#002F34" }}>House</span>
      <span style={{ color: "#00A896" }}>Hunt</span>
     </span>
     <div className="w-5" />
    </header>
    <main className="flex-1 overflow-y-auto p-5 lg:p-6">{children}</main>
   </div>
  </div>
 );
};

export default LandlordLayout;
