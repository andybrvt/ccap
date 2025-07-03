import { Switch, Route, Redirect } from "wouter";
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

import StudentHomepage from "@/pages/student/homepage";
import StudentAnnouncements from "@/pages/student/anouncements";
import StudentPortfolio from "@/pages/student/portfolio";
import StudentEditPortfolio from "@/pages/student/editPortfolio";

function Router() {
  const { user, ProtectedRoute } = useAuth();

  return (
    <Switch>

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

      
      {/* Login route - redirect to appropriate dashboard if already authenticated */}
      <Route path="/login">
        {user ? (
          user.role === "admin" ? <Redirect to="/admin" /> : <Redirect to="/student" />
        ) : (
          <Login />
        )}
      </Route>

      {/* Redirect root to appropriate dashboard based on user role */}
      <Route path="/">
        {user ? (
          user.role === "admin" ? <Redirect to="/admin" /> : <Redirect to="/student" />
        ) : (
          <Redirect to="/login" />
        )}
      </Route>

      {/* Catch all other routes */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  );
}

export default App;
