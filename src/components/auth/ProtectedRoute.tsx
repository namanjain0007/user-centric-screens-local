import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute component that redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // If still loading auth state, show nothing (or could show a loading spinner)
  if (isLoading) {
    return null;
  }

  // If not authenticated, redirect to login with a message
  if (!isAuthenticated) {
    // Show error toast
    toast.error("Login is required to access this page");
    
    // Redirect to login page, saving the attempted URL to redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
