import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, User, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/endpoints";

const registerSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterData = z.infer<typeof registerSchema>;

export default function RegisterStudentPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [, setLocation] = useLocation();
    const { user, login } = useAuth();

    // Redirect to appropriate dashboard if already authenticated
    useEffect(() => {
        if (user) {
            const redirectPath = user.role === "admin" ? "/admin" : "/student";
            setLocation(redirectPath);
        }
    }, [user, setLocation]);

    const form = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            username: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: RegisterData) => {
        setIsSubmitting(true);

        try {
            // Register the student
            const response = await api.post(API_ENDPOINTS.AUTH_REGISTER_STUDENT, {
                email: data.email,
                username: data.username,
                password: data.password,
                role: "student", // This will be forced on backend anyway
            });

            if (response.data) {
                toast.success('Account Created!', {
                    description: 'Welcome! Let\'s get your profile set up.',
                    duration: 5000,
                });

                // Auto-login after registration
                const loginSuccess = await login(data.email, data.password);

                if (loginSuccess) {
                    // Redirect to onboarding - user will be guided through profile setup
                    setTimeout(() => {
                        setLocation("/student/onboarding");
                    }, 100);
                } else {
                    // If auto-login fails, redirect to login page
                    setLocation("/login");
                }
            }
        } catch (error: any) {
            console.error("Registration error:", error);

            const errorMessage = error.response?.data?.detail || "Registration failed. Please try again.";

            toast.error('Registration Failed', {
                description: errorMessage,
                duration: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="bg-black border border-gray-800 shadow-lg">
                    <CardHeader className="space-y-6 text-center pb-8">
                        <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                            <UserPlus className="w-8 h-8 text-black" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-bold text-white">
                                Create Your Account
                            </CardTitle>
                            <p className="text-gray-400">
                                Join C-CAP and start building your culinary career
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
                                        placeholder="personal email address"
                                        className="pl-12 h-12 bg-black border-gray-700 focus:border-white focus:ring-white/10 rounded-lg text-white placeholder-gray-500"
                                        {...form.register("email")}
                                    />
                                </div>
                                <p className="text-yellow-400 text-sm font-medium">
                                    **Do not use your school email address**
                                </p>
                                {form.formState.errors.email && (
                                    <p className="text-red-400 text-sm flex items-center gap-1 mt-1">
                                        {form.formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-white font-medium">
                                    Username
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="Choose a username"
                                        className="pl-12 h-12 bg-black border-gray-700 focus:border-white focus:ring-white/10 rounded-lg text-white placeholder-gray-500"
                                        {...form.register("username")}
                                    />
                                </div>
                                {form.formState.errors.username && (
                                    <p className="text-red-400 text-sm flex items-center gap-1 mt-1">
                                        {form.formState.errors.username.message}
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
                                        placeholder="Create a password"
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
                                    <p className="text-red-400 text-sm flex items-center gap-1 mt-1">
                                        {form.formState.errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-white font-medium">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your password"
                                        className="pl-12 pr-12 h-12 bg-black border-gray-700 focus:border-white focus:ring-white/10 rounded-lg text-white placeholder-gray-500"
                                        {...form.register("confirmPassword")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {form.formState.errors.confirmPassword && (
                                    <p className="text-red-400 text-sm flex items-center gap-1 mt-1">
                                        {form.formState.errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-white hover:bg-gray-200 text-black font-semibold rounded-lg transition-all duration-200"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-black/20 rounded animate-pulse" />
                                        Creating Account...
                                    </div>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </form>

                        <div className="text-center">
                            <p className="text-sm text-gray-400">
                                Already have an account?{" "}
                                <button
                                    onClick={() => setLocation("/login")}
                                    className="text-white hover:underline font-medium"
                                >
                                    Sign in
                                </button>
                            </p>
                        </div>

                        <div className="text-center">
                            <p className="text-xs text-gray-400">
                                By creating an account, you agree to our{" "}
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

