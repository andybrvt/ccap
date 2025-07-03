import { Switch, Route, Redirect } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./hooks/AuthProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner"

import Homepage from "@/pages/homepage";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import Announcements from "@/pages/anouncements";
import Submissions from "@/pages/submissions";
import Portfolio from "@/pages/portfolio";
import PortfolioLookup from "@/pages/portfolioLookup";

function Router() {
  const { user, ProtectedRoute } = useAuth();

  return (
    <Switch>

      {/* Protected routes - automatically handle authentication */}
      <Route path="/">
        <ProtectedRoute>
          <Homepage />
        </ProtectedRoute>
      </Route>
      <Route path="/announcements">
        <ProtectedRoute>
          <Announcements />
        </ProtectedRoute>
      </Route>
      <Route path="/submissions">
        <ProtectedRoute>
          <Submissions />
        </ProtectedRoute>
      </Route>
      <Route path="/portfolio/:id">
        <ProtectedRoute>
          <Portfolio />
        </ProtectedRoute>
      </Route>
      <Route path="/portfolio-lookup">
        <ProtectedRoute>
          <PortfolioLookup />
        </ProtectedRoute>
      </Route>

      {/* Login route - redirect to dashboard if already authenticated */}
      <Route path="/login">
        {user ? <Redirect to="/" /> : <Login />}
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
