import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Eye, EyeOff, User } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/endpoints";

const resetPasswordSchema = z.object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [, setLocation] = useLocation();

    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    const form = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    // Redirect if no token
    useEffect(() => {
        if (!token) {
            toast.error("Invalid reset link");
            setLocation("/login");
        }
    }, [token, setLocation]);

    const onSubmit = async (data: ResetPasswordData) => {
        if (!token) {
            toast.error("Invalid reset link");
            return;
        }

        setIsLoading(true);
        try {
            await api.post(API_ENDPOINTS.AUTH_RESET_PASSWORD, {
                token,
                new_password: data.newPassword,
            });

            toast.success("Password reset successfully!", {
                description: "You can now login with your new password",
            });

            // Redirect to login after 2 seconds
            setTimeout(() => {
                setLocation("/login");
            }, 2000);
        } catch (error: any) {
            console.error("Failed to reset password:", error);
            toast.error("Failed to reset password", {
                description: error.response?.data?.detail || "Please try again",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="bg-black border border-gray-800 shadow-lg">
                    <CardHeader className="space-y-6 text-center pb-8">
                        <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                            <Lock className="w-8 h-8 text-black" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-bold text-white">
                                Reset Your Password
                            </CardTitle>
                            <p className="text-gray-400">
                                Enter your new password below
                            </p>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 px-8 pb-8">
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword" className="text-white font-medium">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <Input
                                        id="newPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your new password"
                                        className="pl-12 pr-12 h-12 bg-black border-gray-700 focus:border-white focus:ring-white/10 rounded-lg text-white placeholder-gray-500"
                                        {...form.register("newPassword")}
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
                                {form.formState.errors.newPassword && (
                                    <p className="text-white text-sm flex items-center gap-1 mt-1">
                                        {form.formState.errors.newPassword.message}
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
                                        placeholder="Confirm your new password"
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
                                    <p className="text-white text-sm flex items-center gap-1 mt-1">
                                        {form.formState.errors.confirmPassword.message}
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
                                        Resetting password...
                                    </div>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>

                        <div className="text-center">
                            <button
                                onClick={() => setLocation("/login")}
                                className="text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

