import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/UsersPage";
import NotificationsPage from "./pages/NotificationsPage";
import ListingsPage from "./pages/ListingsPage";
import PricingPlansPage from "./pages/PricingPlansPage";
import CategoriesPage from "./pages/CategoriesPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthRedirect from "./components/auth/AuthRedirect";
import { useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Index component that redirects based on authentication status
const IndexRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // If still loading, don't redirect yet
  if (isLoading) {
    return null;
  }

  // If authenticated, go to dashboard, otherwise go to login
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<IndexRedirect />} />
            <Route path="/login" element={
              <AuthRedirect>
                <LoginPage />
              </AuthRedirect>
            } />

            {/* Protected routes */}
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/listings" element={<ListingsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/pricing" element={<PricingPlansPage />} />
              {/* Admin routes */}
              <Route path="/admin" element={<AdminUsersPage />} />
              {/* Other routes */}
              <Route path="/payments" element={<div className="text-center py-20">Payments - Coming Soon</div>} />
              <Route path="/settings" element={<div className="text-center py-20">Settings - Coming Soon</div>} />
              <Route path="/help" element={<div className="text-center py-20">Help & Support - Coming Soon</div>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
