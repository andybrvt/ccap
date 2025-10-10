import React, { useContext, createContext } from "react";
import type { ReactNode } from "react";

// Types
export type UserRole = "admin" | "student";

export interface StudentProfile {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  // Add more fields here as needed when we use them in the UI
  // The backend returns all fields, but we only type-check the ones we access
  [key: string]: any; // Allow accessing any other field from backend
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  username: string;
  role: UserRole;
  student_profile?: StudentProfile; // Optional, only for students
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  ProtectedRoute: (props: { children: ReactNode; requiredRole?: UserRole; skipProfileCheck?: boolean }) => React.JSX.Element;
}

// Context
export const AuthContext = createContext<AuthContextType | null>(null);

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}