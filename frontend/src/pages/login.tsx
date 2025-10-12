import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { user, login, isLoading } = useAuth();

  // Redirect to appropriate dashboard if already authenticated
  useEffect(() => {
    if (user) {
      const redirectPath = user.role === "admin" ? "/admin" : "/student";
      setLocation(redirectPath);
    }
  }, [user, setLocation]);

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    const success = await login(data.email, data.password);

    if (success) {
      // Get the user role to determine redirect path
      const storedUser = localStorage.getItem("auth_user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const redirectPath = userData.role === "admin" ? "/admin" : "/student";

        toast.success('Login Successful', {
          description: `Welcome back! Redirecting to ${userData.role} dashboard...`,
          duration: 5000,
        });

        setTimeout(() => {
          setLocation(redirectPath);
        }, 100);
      }
    } else {
      toast.error('Login Failed', {
        description: "Please check your credentials and try again",
        duration: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-black border border-gray-800 shadow-lg">
          <CardHeader className="space-y-6 text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-black" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-white">
                Welcome Back
              </CardTitle>
              <p className="text-gray-400">
                Sign in to continue to your dashboard
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-12 h-12 bg-black border-gray-700 focus:border-white focus:ring-white/10 rounded-lg text-white placeholder-gray-500"
                    {...form.register("email")}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-white text-sm flex items-center gap-1 mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-12 pr-12 h-12 bg-black border-gray-700 focus:border-white focus:ring-white/10 rounded-lg text-white placeholder-gray-500"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-white text-sm flex items-center gap-1 mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-white hover:bg-gray-200 text-black font-semibold rounded-lg transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-black/20 rounded animate-pulse" />
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-400">
                Don't have an account?{" "}
                <button
                  onClick={() => setLocation("/register-student")}
                  className="text-white hover:underline font-medium"
                >
                  Create one here
                </button>
              </p>

              <p className="text-xs text-gray-400">
                By signing in, you agree to our{" "}
                <a href="#" className="text-white hover:underline font-medium">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-white hover:underline font-medium">
                  Privacy Policy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}