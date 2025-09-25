import { Switch, Route } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./hooks/AuthProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner"

import AdminHomepage from "@/pages/admin/homepage";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import AdminAnnouncements from "@/pages/admin/anouncements";
import AdminSubmissions from "@/pages/admin/submissions";
import AdminPortfolio from "@/pages/admin/portfolio";
import AdminPortfolioLookup from "@/pages/admin/portfolioLookup";
import AdminBulkBucketAssign from "@/pages/admin/assignProgramStatus";

import StudentHomepage from "@/pages/student/homepage";
import StudentAnnouncements from "@/pages/student/anouncements";
import StudentPortfolio from "@/pages/student/portfolio";
import StudentEditPortfolio from "@/pages/student/editPortfolio";

// Separate component that uses useAuth - must be inside AuthProvider
function AppRoutes() {
  const { user, ProtectedRoute, isLoading } = useAuth();

  // Show loading screen while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Login route - always accessible */}
      <Route path="/login" component={Login} />

      {/* Admin routes - require admin role */}
      <Route path="/admin">
        <ProtectedRoute requiredRole="admin">
          <AdminHomepage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/announcements">
        <ProtectedRoute requiredRole="admin">
          <AdminAnnouncements />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/submissions">
        <ProtectedRoute requiredRole="admin">
          <AdminSubmissions />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/portfolio/:id">
        <ProtectedRoute requiredRole="admin">
          <AdminPortfolio />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/portfolio-lookup">
        <ProtectedRoute requiredRole="admin">
          <AdminPortfolioLookup />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/assign-program-status">
        <ProtectedRoute requiredRole="admin">
          <AdminBulkBucketAssign />
        </ProtectedRoute>
      </Route>

      {/* Student routes - require student role */}
      <Route path="/student">
        <ProtectedRoute requiredRole="student">
          <StudentHomepage />
        </ProtectedRoute>
      </Route>
      <Route path="/student/announcements">
        <ProtectedRoute requiredRole="student">
          <StudentAnnouncements />
        </ProtectedRoute>
      </Route>
      <Route path="/student/portfolio">
        <ProtectedRoute requiredRole="student">
          <StudentPortfolio />
        </ProtectedRoute>
      </Route>
      <Route path="/student/editPortfolio">
        <ProtectedRoute requiredRole="student">
          <StudentEditPortfolio />
        </ProtectedRoute>
      </Route>

      {/* Root route - protected and will redirect based on role */}
      <Route path="/">
        <ProtectedRoute>
          {user?.role === "admin" ? <AdminHomepage /> : <StudentHomepage />}
        </ProtectedRoute>
      </Route>

      {/* Catch all other routes */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <AuthProvider>
          <Toaster richColors />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  );
}

export default App;