import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthRedirectProps {
  children: ReactNode;
}

/**
 * AuthRedirect component that redirects authenticated users away from login/register pages
 * This is the opposite of ProtectedRoute - it prevents authenticated users from
 * accessing routes they shouldn't need when logged in (like login page)
 */
const AuthRedirect = ({ children }: AuthRedirectProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // If still loading auth state, show nothing (or could show a loading spinner)
  if (isLoading) {
    return null;
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, render the children (login page)
  return <>{children}</>;
};

export default AuthRedirect;
