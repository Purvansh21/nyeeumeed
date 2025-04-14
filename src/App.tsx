
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import RouteGuard from "@/components/layout/RouteGuard";

// Auth Page
import Login from "./pages/Login";

// Admin Pages
import AdminDashboard from "./pages/admin/Index";
import UserManagement from "./pages/admin/Users";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";

// Staff Pages
import StaffDashboard from "./pages/staff/Index";

// Volunteer Pages
import VolunteerDashboard from "./pages/volunteer/Index";

// Beneficiary Pages
import BeneficiaryDashboard from "./pages/beneficiary/Index";

// Shared Pages
import Profile from "./pages/shared/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <RouteGuard>
                <Login />
              </RouteGuard>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <RouteGuard>
                <AdminDashboard />
              </RouteGuard>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RouteGuard>
                <UserManagement />
              </RouteGuard>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <RouteGuard>
                <Analytics />
              </RouteGuard>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <RouteGuard>
                <Settings />
              </RouteGuard>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <RouteGuard>
                <Profile />
              </RouteGuard>
            }
          />
          
          {/* Staff Routes */}
          <Route
            path="/staff"
            element={
              <RouteGuard>
                <StaffDashboard />
              </RouteGuard>
            }
          />
          <Route
            path="/staff/profile"
            element={
              <RouteGuard>
                <Profile />
              </RouteGuard>
            }
          />
          
          {/* Volunteer Routes */}
          <Route
            path="/volunteer"
            element={
              <RouteGuard>
                <VolunteerDashboard />
              </RouteGuard>
            }
          />
          <Route
            path="/volunteer/profile"
            element={
              <RouteGuard>
                <Profile />
              </RouteGuard>
            }
          />
          
          {/* Beneficiary Routes */}
          <Route
            path="/beneficiary"
            element={
              <RouteGuard>
                <BeneficiaryDashboard />
              </RouteGuard>
            }
          />
          <Route
            path="/beneficiary/profile"
            element={
              <RouteGuard>
                <Profile />
              </RouteGuard>
            }
          />
          
          {/* Default Route */}
          <Route
            path="/"
            element={
              <RouteGuard>
                <Login />
              </RouteGuard>
            }
          />
          
          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
