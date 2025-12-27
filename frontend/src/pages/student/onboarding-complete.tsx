import React from 'react';
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, User, Star, Trophy } from "lucide-react";

export default function OnboardingComplete() {
    const [, setLocation] = useLocation();

    const handleViewProfile = () => {
        setLocation('/student/portfolio');
    };

    const handleGoHome = () => {
        setLocation('/student');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Success Animation */}
                <div className="text-center mb-8">
                    <div className="relative inline-block">
                        <CheckCircle className="h-24 w-24 text-green-500 mx-auto animate-pulse" />
                        <div className="absolute -top-2 -right-2">
                            <Star className="h-8 w-8 text-yellow-400 animate-bounce" />
                        </div>
                    </div>
                </div>

                {/* Main Card */}
                <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                            🎉 Congratulations!
                        </CardTitle>
                        <p className="text-xl text-gray-600 mb-4">
                            Welcome to the C•CAP Apprentice Program.
                        </p>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full"></div>
                    </CardHeader>

                    <CardContent className="space-y-8">
                        {/* Success Message */}
                        <div className="text-center space-y-4">
                            <p className="text-lg text-gray-700 leading-relaxed">
                                You've successfully completed your profile setup! Your culinary journey with C•CAP begins now.
                            </p>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-center gap-2 text-green-800">
                                    <Trophy className="h-5 w-5" />
                                    <span className="font-semibold">Profile Complete!</span>
                                </div>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                What's Next?
                            </h3>
                            <ul className="space-y-3 text-blue-800">
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>Review and update your profile anytime</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>Check for announcements and opportunities</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>Start building your culinary portfolio</span>
                                </li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={handleViewProfile}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <User className="h-5 w-5 mr-2" />
                                View Your Profile
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Button>

                            <Button
                                onClick={handleGoHome}
                                variant="outline"
                                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold"
                            >
                                Go to Dashboard
                            </Button>
                        </div>

                        {/* Encouragement */}
                        <div className="text-center pt-4">
                            <p className="text-gray-600 italic">
                                "Every great chef started somewhere. Your journey begins now!"
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 opacity-20">
                    <Star className="h-8 w-8 text-yellow-400 animate-pulse" />
                </div>
                <div className="absolute top-20 right-20 opacity-20">
                    <Trophy className="h-6 w-6 text-blue-400 animate-bounce" />
                </div>
                <div className="absolute bottom-20 left-20 opacity-20">
                    <CheckCircle className="h-6 w-6 text-green-400 animate-pulse" />
                </div>
            </div>
        </div>
    );
}
