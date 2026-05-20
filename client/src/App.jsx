import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthProvider";

// Public pages
import HomePage from "./pages/public/HomePage";
import PropertiesPage from "./pages/public/PropertiesPage";
import PropertyDetailPage from "./pages/public/PropertyDetailPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import ErrorPage from "./pages/public/ErrorPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";

// Landlord pages — Phase 3
import LandlordDashboard from "./pages/landlord/LandlordDashboard";
import LandlordProperties from "./pages/landlord/LandlordProperties";
import AddPropertyPage from "./pages/landlord/AddPropertyPage";
import EditPropertyPage from "./pages/landlord/EditPropertyPage";
import LandlordOrders from "./pages/landlord/LandlordOrders";
import LandlordBilling from "./pages/landlord/LandlordBilling";
import LandlordProfile from "./pages/landlord/LandlordProfile";

// Tenant pages — Phase 4
import FavoritesPage from "./pages/tenant/FavoritesPage";
import CheckoutPage from "./pages/tenant/CheckoutPage";
import MyBookingsPage from "./pages/tenant/MyBookingsPage";
import TenantProfile from "./pages/tenant/TenantProfile";
import LandlordProfilePage from "./pages/public/LandlordProfilePage";

const App = () => (
 <BrowserRouter>
  <AuthProvider>
   <ToastProvider>
    <Routes>
     {/* Public */}
     <Route path="/" element={<HomePage />} />
     <Route path="/properties" element={<PropertiesPage />} />
     <Route path="/properties/:id" element={<PropertyDetailPage />} />
     <Route
      path="/landlord-profile/:landlordId"
      element={<LandlordProfilePage />}
     />
     <Route path="/login" element={<LoginPage />} />
     <Route path="/register" element={<RegisterPage />} />

     {/* Admin */}
     <Route
      path="/admin/dashboard"
      element={
       <ProtectedRoute role="admin">
        <AdminDashboard />
       </ProtectedRoute>
      }
     />
     <Route
      path="/admin/transactions"
      element={
       <ProtectedRoute role="admin">
        <AdminTransactions />
       </ProtectedRoute>
      }
     />
     <Route
      path="/admin/properties"
      element={
       <ProtectedRoute role="admin">
        <AdminProperties />
       </ProtectedRoute>
      }
     />
     <Route
      path="/admin/users"
      element={
       <ProtectedRoute role="admin">
        <AdminUsers />
       </ProtectedRoute>
      }
     />
     <Route
      path="/admin/reports"
      element={
       <ProtectedRoute role="admin">
        <AdminReports />
       </ProtectedRoute>
      }
     />
     <Route
      path="/admin/settings"
      element={
       <ProtectedRoute role="admin">
        <AdminSettings />
       </ProtectedRoute>
      }
     />

     {/* Landlord */}
     <Route
      path="/landlord/dashboard"
      element={
       <ProtectedRoute role="landlord">
        <LandlordDashboard />
       </ProtectedRoute>
      }
     />
     <Route
      path="/landlord/properties"
      element={
       <ProtectedRoute role="landlord">
        <LandlordProperties />
       </ProtectedRoute>
      }
     />
     <Route
      path="/landlord/properties/add"
      element={
       <ProtectedRoute role="landlord">
        <AddPropertyPage />
       </ProtectedRoute>
      }
     />
     <Route
      path="/landlord/properties/edit/:id"
      element={
       <ProtectedRoute role="landlord">
        <EditPropertyPage />
       </ProtectedRoute>
      }
     />
     <Route
      path="/landlord/orders"
      element={
       <ProtectedRoute role="landlord">
        <LandlordOrders />
       </ProtectedRoute>
      }
     />
     <Route
      path="/landlord/billing"
      element={
       <ProtectedRoute role="landlord">
        <LandlordBilling />
       </ProtectedRoute>
      }
     />
     <Route
      path="/landlord/profile"
      element={
       <ProtectedRoute role="landlord">
        <LandlordProfile />
       </ProtectedRoute>
      }
     />

     {/* Tenant */}
     <Route
      path="/favorites"
      element={
       <ProtectedRoute role="tenant">
        <FavoritesPage />
       </ProtectedRoute>
      }
     />
     <Route
      path="/checkout/:propertyId"
      element={
       <ProtectedRoute role="tenant">
        <CheckoutPage />
       </ProtectedRoute>
      }
     />
     <Route
      path="/my-bookings"
      element={
       <ProtectedRoute role="tenant">
        <MyBookingsPage />
       </ProtectedRoute>
      }
     />
     <Route
      path="/profile"
      element={
       <ProtectedRoute role="tenant">
        <TenantProfile />
       </ProtectedRoute>
      }
     />

     {/* 404 */}
     <Route path="*" element={<ErrorPage type="notfound" />} />
    </Routes>
   </ToastProvider>
  </AuthProvider>
 </BrowserRouter>
);

export default App;
