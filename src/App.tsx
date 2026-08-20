import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import RoleLayout from "@/components/RoleLayout";
import Login from "@/pages/Login";

// Customer pages
import CustomerDashboard from "@/pages/customer/CustomerDashboard";
import CustomerVehicles from "@/pages/customer/CustomerVehicles";
import EmergencyRequest from "@/pages/customer/EmergencyRequest";
import CustomerActiveRequest from "@/pages/customer/CustomerActiveRequest";
import CustomerHistory from "@/pages/customer/CustomerHistory";
import CustomerPayments from "@/pages/customer/CustomerPayments";
import CustomerProfile from "@/pages/customer/CustomerProfile";

// Mechanic pages
import MechanicDashboard from "@/pages/mechanic/MechanicDashboard";
import MechanicIncoming from "@/pages/mechanic/MechanicIncoming";
import MechanicActiveService from "@/pages/mechanic/MechanicActiveService";
import MechanicHistory from "@/pages/mechanic/MechanicHistory";
import MechanicEarnings from "@/pages/mechanic/MechanicEarnings";
import MechanicProfile from "@/pages/mechanic/MechanicProfile";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminLiveMap from "@/pages/admin/AdminLiveMap";
import AdminRequests from "@/pages/admin/AdminRequests";
import AdminMechanics from "@/pages/admin/AdminMechanics";
import AdminSettings from "@/pages/admin/AdminSettings";

function ProtectedRoutes() {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/" replace />;

  return (
    <Routes>
      {/* Customer */}
      <Route path="/customer" element={<RoleLayout role="customer"><CustomerDashboard /></RoleLayout>} />
      <Route path="/customer/vehicles" element={<RoleLayout role="customer"><CustomerVehicles /></RoleLayout>} />
      <Route path="/customer/emergency" element={<RoleLayout role="customer"><EmergencyRequest /></RoleLayout>} />
      <Route path="/customer/active" element={<RoleLayout role="customer"><CustomerActiveRequest /></RoleLayout>} />
      <Route path="/customer/history" element={<RoleLayout role="customer"><CustomerHistory /></RoleLayout>} />
      <Route path="/customer/payments" element={<RoleLayout role="customer"><CustomerPayments /></RoleLayout>} />
      <Route path="/customer/profile" element={<RoleLayout role="customer"><CustomerProfile /></RoleLayout>} />

      {/* Mechanic */}
      <Route path="/mechanic" element={<RoleLayout role="mechanic"><MechanicDashboard /></RoleLayout>} />
      <Route path="/mechanic/incoming" element={<RoleLayout role="mechanic"><MechanicIncoming /></RoleLayout>} />
      <Route path="/mechanic/active" element={<RoleLayout role="mechanic"><MechanicActiveService /></RoleLayout>} />
      <Route path="/mechanic/history" element={<RoleLayout role="mechanic"><MechanicHistory /></RoleLayout>} />
      <Route path="/mechanic/earnings" element={<RoleLayout role="mechanic"><MechanicEarnings /></RoleLayout>} />
      <Route path="/mechanic/profile" element={<RoleLayout role="mechanic"><MechanicProfile /></RoleLayout>} />

      {/* Admin */}
      <Route path="/admin" element={<RoleLayout role="admin"><AdminDashboard /></RoleLayout>} />
      <Route path="/admin/live-map" element={<RoleLayout role="admin"><AdminLiveMap /></RoleLayout>} />
      <Route path="/admin/requests" element={<RoleLayout role="admin"><AdminRequests /></RoleLayout>} />
      <Route path="/admin/mechanics" element={<RoleLayout role="admin"><AdminMechanics /></RoleLayout>} />
      <Route path="/admin/settings" element={<RoleLayout role="admin"><AdminSettings /></RoleLayout>} />

      <Route path="*" element={<Navigate to={`/${currentUser.role}`} replace />} />
    </Routes>
  );
}

function AppRoutes() {
  const { currentUser } = useApp();
  return (
    <Routes>
      <Route path="/" element={currentUser ? <Navigate to={`/${currentUser.role}`} replace /> : <Login />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
