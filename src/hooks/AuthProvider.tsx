import React from "react";
import {
  useState,
  useEffect,
} from "react";
import { useLocation, Redirect } from "wouter";
import { authApi } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { AuthContext, type User } from "./useAuth";
import type { ReactNode } from "react";



export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
        validateToken();
      } catch (error) {
        logout();
      }
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

  // --- Dummy logic ---
  const login = async (email: string, password: string): Promise<boolean> => {
    if (!email || !password) {
      return false;
    }
    setIsLoading(true);
    // Dummy credentials
    const dummyEmail = "nishant@test.com";
    const dummyPassword = "123456";
    if (email === dummyEmail && password === dummyPassword) {
      const dummyUser: User = {
        id: 1,
        email: dummyEmail,
        full_name: "Test Nishant",
        username: "test_nishant",
      };
      setUser(dummyUser);
      localStorage.setItem("auth_user", JSON.stringify(dummyUser));
      localStorage.setItem("authToken", "dummy-token");
      setIsLoading(false);
      return true;
    } else {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("authToken");
    setLocation("/login");
  };

  // Protected Route component that handles authentication automatically
  const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }
    if (!user) {
      return <Redirect to="/login" />;
    }
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