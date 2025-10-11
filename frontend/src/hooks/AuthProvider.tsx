import React from "react";
import {
  useState,
  useEffect,
} from "react";
import { useLocation, Redirect } from "wouter";
import { api } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { AuthContext, type User, type UserRole } from "./useAuth";
import type { ReactNode } from "react";



export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if user is stored in localStorage and validate with server
    const storedUser = localStorage.getItem("auth_user");
    const authToken = localStorage.getItem("authToken");

    if (storedUser && authToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Optionally validate token with auth/me endpoint on app load
        validateToken().finally(() => {
          setIsLoading(false);
        });
      } catch (error) {
        logout();
        setIsLoading(false);
      }
    } else {
      // No stored user, set loading to false
      setIsLoading(false);
    }
  }, []);

  const validateToken = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH_ME);
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      logout();
    }
  };

  // Real API login
  const login = async (email: string, password: string): Promise<boolean> => {
    if (!email || !password) {
      return false;
    }
    setIsLoading(true);
    try {
      const response = await api.post(API_ENDPOINTS.AUTH_LOGIN, {
        email: email,
        password: password,
      });

      if (response.data && response.data.access_token) {
        // Store the auth token
        localStorage.setItem("authToken", response.data.access_token);

        // Get user data from auth/me endpoint
        const userResponse = await api.get(API_ENDPOINTS.AUTH_ME);
        if (userResponse.data) {
          setUser(userResponse.data);
          localStorage.setItem("auth_user", JSON.stringify(userResponse.data));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("authToken");
    setLocation("/login");
  };

  // Helper function to check if student profile is complete
  const isProfileComplete = (user: User): boolean => {
    if (user.role !== 'student') return true; // Admins don't need profile completion

    // Check if student_profile exists and has basic required fields
    const profile = user.student_profile;
    if (!profile) return false;

    // Only check for the absolute minimum required fields
    const checkField = (field: any) => field && String(field).trim().length > 0;

    // Just check for basic profile info - much more lenient
    return !!(
      checkField(profile.first_name) &&
      checkField(profile.last_name) &&
      checkField(profile.email)
    );
  };

  // Protected Route component that handles authentication and role-based access
  const ProtectedRoute = ({ children, requiredRole, skipProfileCheck }: {
    children: ReactNode;
    requiredRole?: UserRole;
    skipProfileCheck?: boolean; // Allow skipping profile check for editPortfolio page
  }) => {
    const [location, setLocation] = useLocation();

    useEffect(() => {
      // Don't redirect while loading
      if (isLoading) return;

      // If not authenticated, redirect to login
      if (!user) {
        setLocation('/login');
        return;
      }

      // Check role-based access if requiredRole is specified
      if (requiredRole && user.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        if (user.role === "admin") {
          setLocation('/admin');
        } else {
          setLocation('/student');
        }
        return;
      }

      // Skip profile completion check - let users navigate freely
      // They can complete their profile at their own pace
    }, [requiredRole, setLocation, location, skipProfileCheck]);

    // Show loading spinner while auth is initializing
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    // Show loading spinner while redirecting (instead of null)
    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    // Check role-based access if requiredRole is specified
    if (requiredRole && user.role !== requiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    // Only render if authenticated and has correct role
    return <>{children}</>;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        ProtectedRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}