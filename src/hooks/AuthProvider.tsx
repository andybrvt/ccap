import React from "react";
import {
  useState,
  useEffect,
} from "react";
import { useLocation, Redirect } from "wouter";
import { authApi } from "@/lib/apiService";
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

  // --- Real API code (commented out) ---
  // const validateToken = async () => {
  //   try {
  //     const response = await authApi.get(API_ENDPOINTS.AUTH_ME);
  //     if (response.data) {
  //       setUser(response.data);
  //     }
  //   } catch (error) {
  //     logout();
  //   }
  // };

  // --- Dummy logic ---
  const validateToken = async () => {
    // Simulate token validation by restoring dummy user if token exists
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      logout();
    }
  };

  // --- Real API code (commented out) ---
  // const login = async (email: string, password: string): Promise<boolean> => {
  //   if (!email || !password) {
  //     return false;
  //   }
  //   setIsLoading(true);
  //   try {
  //     const response = await authApi.post(API_ENDPOINTS.AUTH_LOGIN, {
  //       email: email,
  //       password: password,
  //       platform_id: 2,
  //     });
  //     if (response.data && response.data.authToken) {
  //       // Store the auth token
  //       localStorage.setItem("authToken", response.data.authToken);
  //       // Get user data from auth/me endpoint
  //       const userResponse = await authApi.get(API_ENDPOINTS.AUTH_ME);
  //       if (userResponse.data) {
  //         setUser(userResponse.data);
  //         localStorage.setItem("auth_user", JSON.stringify(userResponse.data));
  //         return true;
  //       }
  //     }
  //     return false;
  //   } catch (error) {
  //     console.error("Login error:", error);
  //     return false;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // --- Dummy logic with role-based authentication ---
  const login = async (email: string, password: string): Promise<boolean> => {
    if (!email || !password) {
      return false;
    }
    setIsLoading(true);
    try {
      // Dummy credentials for different user types
      const adminEmail = "admin@test.com";
      const adminPassword = "admin123";
      const studentEmail = "student@test.com";
      const studentPassword = "student123";

      let dummyUser: User | null = null;

      if (email === adminEmail && password === adminPassword) {
        dummyUser = {
          id: 1,
          email: adminEmail,
          full_name: "Admin User",
          username: "admin_user",
          role: "admin",
        };
      } else if (email === studentEmail && password === studentPassword) {
        dummyUser = {
          id: 2,
          email: studentEmail,
          full_name: "Student User",
          username: "student_user",
          role: "student",
        };
      }

      if (dummyUser) {
        setUser(dummyUser);
        localStorage.setItem("auth_user", JSON.stringify(dummyUser));
        localStorage.setItem("authToken", "dummy-token");
        return true;
      } else {
        return false;
      }
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

  // Protected Route component that handles authentication and role-based access
  const ProtectedRoute = ({ children, requiredRole }: { children: ReactNode; requiredRole?: UserRole }) => {
    const [, setLocation] = useLocation();

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
      }
    }, [requiredRole, setLocation]);

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