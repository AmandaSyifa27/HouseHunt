import { NavLink, useNavigate } from "react-router-dom";
import {
 LayoutDashboard,
 CreditCard,
 Building2,
 Users,
 LogOut,
 Menu,
 Flag,
 Settings,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const NAV_ITEMS = [
 { to: "/admin/dashboard", Icon: LayoutDashboard, label: "Dashboard" },
 { to: "/admin/transactions", Icon: CreditCard, label: "Transactions" },
 { to: "/admin/properties", Icon: Building2, label: "Properties" },
 { to: "/admin/users", Icon: Users, label: "Users" },
 { to: "/admin/reports", Icon: Flag, label: "Reports" },
 { to: "/admin/settings", Icon: Settings, label: "Settings" },
];

const SidebarContent = ({ user, setMobileOpen, handleLogout }) => (
 <div className="flex flex-col h-full">
  <div className="px-5 py-5 border-b border-white/10">
   <p className="font-bold text-white text-base">HouseHunt Admin</p>
   <p className="text-white/50 text-xs mt-0.5">Property Management</p>
  </div>

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

  <div className="px-3 py-4 border-t border-white/10">
   <div className="flex items-center gap-3 px-3 py-2 mb-2">
    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
     {user?.name?.[0] || "A"}
    </div>
    <div className="flex-1 min-w-0">
     <p className="text-sm font-medium text-white truncate">{user?.name}</p>
     <p className="text-xs text-white/50">Super Admin</p>
    </div>
   </div>
   <button
    onClick={handleLogout}
    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
   >
    <LogOut size={18} /> Log Out
   </button>
  </div>
 </div>
);

const AdminLayout = ({ children }) => {
 const { user, logout } = useAuth();
 const navigate = useNavigate();
 const [mobileOpen, setMobileOpen] = useState(false);

 const handleLogout = () => {
  logout();
  navigate("/");
 };

 return (
  <div className="flex h-screen bg-[#EBEEEF] overflow-hidden">
   <aside
    className="hidden lg:flex flex-col w-48 shrink-0"
    style={{ backgroundColor: "#002F34" }}
   >
    <SidebarContent
     user={user}
     setMobileOpen={setMobileOpen}
     handleLogout={handleLogout}
    />
   </aside>

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
      <SidebarContent
       user={user}
       setMobileOpen={setMobileOpen}
       handleLogout={handleLogout}
      />
     </aside>
    </div>
   )}

   <div className="flex-1 flex flex-col overflow-hidden">
    <header className="bg-white border-b border-gray-100 h-14 flex items-center justify-between px-5 shrink-0">
     <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
      <Menu size={20} className="text-gray-600" />
     </button>
     <div className="flex-1" />
     <div className="flex items-center gap-3">
      <div className="text-right hidden sm:block">
       <p className="text-sm font-medium text-gray-800">{user?.name}</p>
       <p className="text-xs text-gray-400">Super Admin</p>
      </div>
      {user?.profileImage ? (
       <img
        src={user.profileImage}
        alt=""
        className="w-8 h-8 rounded-full object-cover"
       />
      ) : (
       <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
        style={{ backgroundColor: "#002F34" }}
       >
        {user?.name?.[0]}
       </div>
      )}
     </div>
    </header>

    <main className="flex-1 overflow-y-auto p-5 lg:p-6">{children}</main>
   </div>
  </div>
 );
};

export default AdminLayout;
