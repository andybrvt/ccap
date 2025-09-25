import React, { useContext, createContext } from "react";
import type { ReactNode } from "react";

// Types
export type UserRole = "admin" | "student";

export interface User {
  id: number;
  email: string;
  full_name: string;
  username: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  ProtectedRoute: (props: { children: ReactNode; requiredRole?: UserRole }) => React.JSX.Element;
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