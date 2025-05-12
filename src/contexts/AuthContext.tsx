import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isAuthenticated, login, logout, LoginCredentials, LoginResponse } from '@/services/authService';

// User information type
export interface AuthUser {
  admin_id: number;
  name: string;
  email: string;
  admin_user_type: string;
}

// Define the shape of our auth context
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => void;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {
    throw new Error('login function not implemented');
  },
  logout: () => {
    throw new Error('logout function not implemented');
  },
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component to wrap the app and provide auth context
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null as AuthUser | null,
  });

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();

      setAuthState({
        isAuthenticated: authenticated,
        isLoading: false,
        user: null, // We don't store user info in sessionStorage anymore
      });
    };

    checkAuth();
  }, []);

  // Login handler
  const handleLogin = async (credentials: LoginCredentials) => {
    const response = await login(credentials);

    // We only store the token in sessionStorage (handled in authService.ts)
    // No user info is stored in sessionStorage

    setAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: response.user, // Keep user in memory (state) but not in sessionStorage
    });
    return response;
  };

  // Logout handler
  const handleLogout = () => {
    logout(); // This removes the token from sessionStorage

    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  };

  // Value to be provided by the context
  const value = {
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    user: authState.user,
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
