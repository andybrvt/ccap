import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { api } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiSelect } from "@/components/ui/multi-select";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { CCAP_CONNECTION_DROPDOWN_OPTIONS, CULINARY_INTEREST_OPTIONS } from "@/lib/constants";

// Constants
const STATES = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const STATES_OPTIONS = STATES.map(state => ({ value: state, label: state }));

const TRANSPORTATION_OPTIONS = [
    "Own Car",
    "Public Transportation",
    "Walk",
    "Bicycle",
    "Carpool/Rideshare",
    "Other"
];

const AVAILABILITY_OPTIONS = [
    "Morning (6am-12pm)",
    "Afternoon (12pm-6pm)",
    "Evening (6pm-12am)",
    "Overnight (12am-6am)",
    "Flexible"
];


export default function StudentOnboarding() {
    const { user, refreshUser } = useAuth();
    const [, setLocation] = useLocation();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        // Step 1: Personal Info
        firstName: "",
        lastName: "",
        preferredName: "",
        dateOfBirth: "",
        phone: "",
        bio: "",
        profilePicture: null as File | null,
        existingProfilePicture: "",

        // Step 2: Address
        address: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: "",
        willingToRelocate: "",
        relocationStates: [] as string[],

        // Step 3: Education
        highSchool: "",
        culinaryTeacher: "",
        graduationYear: "",
        culinaryClassYears: 0,
        transportation: "",
        ccapConnection: "",

        // Step 4: Work Experience
        currentlyEmployed: "",
        currentEmployer: "",
        currentPosition: "",
        currentHoursPerWeek: 0,
        previousEmployment: "",
        previousEmployer: "",
        previousPosition: "",
        previousHoursPerWeek: 0,

        // Step 5: Availability
        hoursPerWeek: 0,
        availability: [] as string[],
        weekendAvailability: "",
        readyToWork: "",
        availableDate: "",

        // Step 6: Interests & Documents
        interests: [] as string[],
        hasResume: "",
        resumeUpload: null as File | null,
        existingResumeUrl: "",
        hasFoodHandlersCard: "",
        foodHandlersCardUpload: null as File | null,
        existingFoodHandlersUrl: "",
        hasServSafe: "",
        servSafeUpload: null as File | null,
        existingServSafeUrl: "",
    });

    // File upload states
    const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
    const [isUploadingResume, setIsUploadingResume] = useState(false);
    const [isUploadingCredential, setIsUploadingCredential] = useState(false);
    const [isUploadingServSafe, setIsUploadingServSafe] = useState(false);

    // Validation state
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Fetch profile and onboarding step on mount
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user || user.role !== 'student') return;

            try {
                setIsLoadingProfile(true);
                const response = await api.get(API_ENDPOINTS.STUDENT_GET_PROFILE);
                if (response.data) {
                    const profile = response.data;

                    // Set current step from backend
                    setCurrentStep(profile.onboarding_step || 1);

                    // Populate form data
                    setFormData({
                        firstName: profile.first_name || "",
                        lastName: profile.last_name || "",
                        preferredName: profile.preferred_name || "",
                        dateOfBirth: profile.date_of_birth || "",
                        phone: profile.phone || "",
                        bio: profile.bio || "",
                        profilePicture: null,
                        existingProfilePicture: profile.profile_picture_url || "",
                        address: profile.address || "",
                        addressLine2: profile.address_line2 || "",
                        city: profile.city || "",
                        state: profile.state || "",
                        zipCode: profile.zip_code || "",
                        willingToRelocate: profile.willing_to_relocate || "",
                        relocationStates: profile.relocation_states || [],
                        highSchool: profile.high_school || "",
                        culinaryTeacher: profile.culinary_teacher || "",
                        graduationYear: profile.graduation_year || "",
                        culinaryClassYears: profile.culinary_class_years || 0,
                        transportation: profile.transportation || "",
                        ccapConnection: profile.ccap_connection || "",
                        currentlyEmployed: profile.currently_employed || "",
                        currentEmployer: profile.current_employer || "",
                        currentPosition: profile.current_position || "",
                        currentHoursPerWeek: profile.current_hours_per_week || 0,
                        previousEmployment: profile.previous_employment || "",
                        previousEmployer: profile.previous_employer || "",
                        previousPosition: profile.previous_position || "",
                        previousHoursPerWeek: profile.previous_hours_per_week || 0,
                        hoursPerWeek: profile.hours_per_week || 0,
                        availability: profile.availability || [],
                        weekendAvailability: profile.weekend_availability || "",
                        readyToWork: profile.ready_to_work || "",
                        availableDate: profile.available_date || "",
                        interests: profile.interests || [],
                        hasResume: profile.has_resume || "",
                        resumeUpload: null,
                        existingResumeUrl: profile.resume_url || "",
                        hasFoodHandlersCard: profile.has_food_handlers_card || "",
                        foodHandlersCardUpload: null,
                        existingFoodHandlersUrl: profile.food_handlers_card_url || "",
                        hasServSafe: profile.has_servsafe || "",
                        servSafeUpload: null,
                        existingServSafeUrl: profile.servsafe_certificate_url || "",
                    });
                }
            } catch (error) {
                console.error('Failed to load profile:', error);
            } finally {
                setIsLoadingProfile(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear validation error when user starts typing
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Phone number formatting function
    const formatPhoneNumber = (value: string) => {
        // Remove all non-numeric characters
        const phoneNumber = value.replace(/\D/g, '');

        // Don't format if empty
        if (!phoneNumber) return '';

        // Format based on length
        if (phoneNumber.length <= 3) {
            return `(${phoneNumber}`;
        } else if (phoneNumber.length <= 6) {
            return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        } else {
            return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
        }
    };

    const handlePhoneChange = (value: string) => {
        const formatted = formatPhoneNumber(value);
        handleInputChange('phone', formatted);
    };

    // Validation functions for each step
    const validateStep1 = () => {
        const errors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required';
        }
        if (!formData.dateOfBirth) {
            errors.dateOfBirth = 'Date of birth is required';
        }
        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else {
            // Extract digits from formatted phone number
            const phoneDigits = formData.phone.replace(/\D/g, '');
            if (phoneDigits.length !== 10) {
                errors.phone = 'Please enter a complete 10-digit phone number';
            }
        }
        if (!formData.ccapConnection) {
            errors.ccapConnection = 'C•CAP connection is required';
        }

        return errors;
    };

    const validateStep2 = () => {
        const errors: Record<string, string> = {};

        if (!formData.address.trim()) {
            errors.address = 'Street address is required';
        }
        if (!formData.city.trim()) {
            errors.city = 'City is required';
        }
        if (!formData.state) {
            errors.state = 'State is required';
        }
        if (!formData.zipCode.trim()) {
            errors.zipCode = 'Zip code is required';
        }
        if (!formData.willingToRelocate) {
            errors.willingToRelocate = 'Please specify if you are willing to relocate';
        }
        // If they're willing to relocate, they must select at least one state
        if (formData.willingToRelocate === "Yes" && formData.relocationStates.length === 0) {
            errors.relocationStates = 'Please select at least one state you would consider relocating to';
        }

        return errors;
    };

    const validateStep3 = () => {
        const errors: Record<string, string> = {};

        if (!formData.highSchool.trim()) {
            errors.highSchool = 'Name of high school/culinary school is required';
        }
        if (!formData.culinaryTeacher.trim()) {
            errors.culinaryTeacher = 'Culinary teacher name is required';
        }
        if (!formData.graduationYear) {
            errors.graduationYear = 'Graduation year is required';
        }
        if (!formData.culinaryClassYears || formData.culinaryClassYears === 0) {
            errors.culinaryClassYears = 'Years in culinary program is required';
        } else if (isNaN(Number(formData.culinaryClassYears)) || Number(formData.culinaryClassYears) < 0) {
            errors.culinaryClassYears = 'Please enter a valid number of years';
        }
        if (!formData.transportation) {
            errors.transportation = 'Transportation method is required';
        }

        return errors;
    };

    const validateStep4 = () => {
        const errors: Record<string, string> = {};

        if (!formData.currentlyEmployed) {
            errors.currentlyEmployed = 'Please specify if you are currently employed';
        }
        if (!formData.previousEmployment) {
            errors.previousEmployment = 'Please specify if you have had previous employment';
        }

        // If currently employed, validate employment details
        if (formData.currentlyEmployed === "Yes") {
            if (!formData.currentEmployer.trim()) {
                errors.currentEmployer = 'Current employer is required';
            }
            if (!formData.currentPosition.trim()) {
                errors.currentPosition = 'Current position is required';
            }
            if (!formData.currentHoursPerWeek || formData.currentHoursPerWeek === 0) {
                errors.currentHoursPerWeek = 'Current hours per week is required';
            } else if (isNaN(Number(formData.currentHoursPerWeek)) || Number(formData.currentHoursPerWeek) < 0) {
                errors.currentHoursPerWeek = 'Please enter a valid number of hours';
            }
        }

        // If previously employed, validate previous employment details
        if (formData.previousEmployment === "Yes") {
            if (!formData.previousEmployer.trim()) {
                errors.previousEmployer = 'Previous employer is required';
            }
            if (!formData.previousPosition.trim()) {
                errors.previousPosition = 'Previous position is required';
            }
            if (!formData.previousHoursPerWeek || formData.previousHoursPerWeek === 0) {
                errors.previousHoursPerWeek = 'Previous hours per week is required';
            } else if (isNaN(Number(formData.previousHoursPerWeek)) || Number(formData.previousHoursPerWeek) < 0) {
                errors.previousHoursPerWeek = 'Please enter a valid number of hours';
            }
        }

        return errors;
    };

    const validateStep5 = () => {
        const errors: Record<string, string> = {};

        if (!formData.hoursPerWeek || formData.hoursPerWeek === 0) {
            errors.hoursPerWeek = 'Desired hours per week is required';
        } else if (isNaN(Number(formData.hoursPerWeek)) || Number(formData.hoursPerWeek) < 0) {
            errors.hoursPerWeek = 'Please enter a valid number of hours';
        }
        if (formData.availability.length === 0) {
            errors.availability = 'Please select at least one availability time';
        }
        if (!formData.weekendAvailability) {
            errors.weekendAvailability = 'Please specify weekend availability';
        }
        if (!formData.readyToWork) {
            errors.readyToWork = 'Please specify if you are ready to work immediately';
        }

        return errors;
    };

    const validateStep6 = () => {
        const errors: Record<string, string> = {};

        if (formData.interests.length === 0) {
            errors.interests = 'Please select at least one culinary interest';
        }
        if (!formData.hasResume) {
            errors.hasResume = 'Please specify if you have a resume';
        }
        if (!formData.hasFoodHandlersCard) {
            errors.hasFoodHandlersCard = 'Please specify if you have a Food Handlers Card';
        }
        if (!formData.hasServSafe) {
            errors.hasServSafe = 'Please specify if you have ServSafe certification';
        }

        // If they say they have a resume, validate that they've uploaded it
        if (formData.hasResume === "Yes") {
            if (!formData.existingResumeUrl && !formData.resumeUpload) {
                errors.resumeUpload = 'Please upload your resume';
            }
        }

        // If they say they have a Food Handlers Card, validate that they've uploaded it
        if (formData.hasFoodHandlersCard === "Yes") {
            if (!formData.existingFoodHandlersUrl && !formData.foodHandlersCardUpload) {
                errors.foodHandlersCardUpload = 'Please upload your Food Handlers Card';
            }
        }

        // If they say they have ServSafe certification, validate that they've uploaded it
        if (formData.hasServSafe === "Yes") {
            if (!formData.existingServSafeUrl && !formData.servSafeUpload) {
                errors.servSafeUpload = 'Please upload your ServSafe certificate';
            }
        }

        return errors;
    };

    const validateCurrentStep = () => {
        let errors: Record<string, string> = {};

        switch (currentStep) {
            case 1:
                errors = validateStep1();
                break;
            case 2:
                errors = validateStep2();
                break;
            case 3:
                errors = validateStep3();
                break;
            case 4:
                errors = validateStep4();
                break;
            case 5:
                errors = validateStep5();
                break;
            case 6:
                errors = validateStep6();
                break;
            default:
                break;
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // File upload handlers (same as editPortfolio)
    const handleProfilePictureUpload = async (file: File | null) => {
        if (!file) {
            setFormData(prev => ({ ...prev, profilePicture: null }));
            return;
        }

        setIsUploadingProfilePic(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post(API_ENDPOINTS.STUDENT_UPLOAD_PROFILE_PICTURE, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data?.profile_picture_url) {
                console.log('Profile picture upload successful:', response.data.profile_picture_url); // Debug
                setFormData(prev => ({
                    ...prev,
                    existingProfilePicture: response.data.profile_picture_url,
                    profilePicture: file // Set the file state too
                }));
                toast.success('Profile picture uploaded successfully!');
            } else {
                console.error('No profile_picture_url in response:', response.data); // Debug
                toast.error('Upload successful but no image URL returned');
            }
        } catch (error) {
            console.error('Failed to upload profile picture:', error);
            toast.error('Failed to upload profile picture');
        } finally {
            setIsUploadingProfilePic(false);
        }
    };

    const handleResumeUpload = async (file: File | null) => {
        if (!file) {
            setFormData(prev => ({ ...prev, resumeUpload: null }));
            return;
        }

        setIsUploadingResume(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post(API_ENDPOINTS.STUDENT_UPLOAD_RESUME, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data?.resume_url) {
                console.log('Resume upload successful:', response.data.resume_url); // Debug
                setFormData(prev => ({
                    ...prev,
                    existingResumeUrl: response.data.resume_url,
                    resumeUpload: file // Set the file state too
                }));
                toast.success('Resume uploaded successfully!');
            } else {
                console.error('No resume_url in response:', response.data); // Debug
                toast.error('Upload successful but no resume URL returned');
            }
        } catch (error) {
            console.error('Failed to upload resume:', error);
            toast.error('Failed to upload resume');
        } finally {
            setIsUploadingResume(false);
        }
    };

    const handleCredentialUpload = async (file: File | null) => {
        if (!file) {
            setFormData(prev => ({ ...prev, foodHandlersCardUpload: null }));
            return;
        }

        setIsUploadingCredential(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post(API_ENDPOINTS.STUDENT_UPLOAD_CREDENTIAL, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data?.food_handlers_card_url) {
                console.log('Food Handlers Card upload successful:', response.data.food_handlers_card_url); // Debug
                setFormData(prev => ({
                    ...prev,
                    existingFoodHandlersUrl: response.data.food_handlers_card_url,
                    foodHandlersCardUpload: file // Set the file state too
                }));
                toast.success('Food Handlers Card uploaded successfully!');
            } else {
                console.error('No food_handlers_card_url in response:', response.data); // Debug
                toast.error('Upload successful but no certificate URL returned');
            }
        } catch (error) {
            console.error('Failed to upload credential:', error);
            toast.error('Failed to upload credential');
        } finally {
            setIsUploadingCredential(false);
        }
    };

    const handleServSafeUpload = async (file: File | null) => {
        if (!file) {
            setFormData(prev => ({ ...prev, servSafeUpload: null }));
            return;
        }

        setIsUploadingServSafe(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post(API_ENDPOINTS.STUDENT_UPLOAD_SERVSAFE, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data?.servsafe_certificate_url) {
                console.log('ServSafe certificate upload successful:', response.data.servsafe_certificate_url); // Debug
                setFormData(prev => ({
                    ...prev,
                    existingServSafeUrl: response.data.servsafe_certificate_url,
                    servSafeUpload: file // Set the file state too
                }));
                toast.success('ServSafe certificate uploaded successfully!');
            } else {
                console.error('No servsafe_certificate_url in response:', response.data); // Debug
                toast.error('Upload successful but no certificate URL returned');
            }
        } catch (error) {
            console.error('Failed to upload ServSafe certificate:', error);
            toast.error('Failed to upload ServSafe certificate');
        } finally {
            setIsUploadingServSafe(false);
        }
    };

    // Save progress and move to next/previous step
    const saveAndContinue = async (nextStep: number) => {
        // Validate current step before proceeding
        if (!validateCurrentStep()) {
            toast.error('Please fill in all required fields before continuing');
            return;
        }

        setIsSaving(true);
        try {
            // Prepare payload
            const payload = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                preferred_name: formData.preferredName,
                date_of_birth: formData.dateOfBirth,
                phone: formData.phone,
                bio: formData.bio,
                address: formData.address,
                address_line2: formData.addressLine2,
                city: formData.city,
                state: formData.state,
                zip_code: formData.zipCode,
                willing_to_relocate: formData.willingToRelocate,
                relocation_states: formData.relocationStates,
                high_school: formData.highSchool,
                culinary_teacher: formData.culinaryTeacher,
                graduation_year: formData.graduationYear,
                culinary_class_years: formData.culinaryClassYears,
                transportation: formData.transportation,
                ccap_connection: formData.ccapConnection,
                currently_employed: formData.currentlyEmployed,
                current_employer: formData.currentEmployer,
                current_position: formData.currentPosition,
                current_hours_per_week: formData.currentHoursPerWeek,
                previous_employment: formData.previousEmployment,
                previous_employer: formData.previousEmployer,
                previous_position: formData.previousPosition,
                previous_hours_per_week: formData.previousHoursPerWeek,
                hours_per_week: formData.hoursPerWeek,
                availability: formData.availability,
                weekend_availability: formData.weekendAvailability,
                ready_to_work: formData.readyToWork,
                available_date: formData.availableDate,
                interests: formData.interests,
                has_resume: formData.hasResume,
                has_food_handlers_card: formData.hasFoodHandlersCard,
                has_servsafe: formData.hasServSafe,
                onboarding_step: nextStep, // Update step
            };

            await api.put(API_ENDPOINTS.STUDENT_UPDATE_PROFILE, payload);

            if (nextStep === 0) {
                // Onboarding complete! Refresh user data to update onboarding_step
                await refreshUser();
                toast.success('Onboarding complete! Welcome to C•CAP!');
                // Small delay to ensure state updates
                setTimeout(() => {
                    setLocation('/student/onboarding-complete');
                }, 100);
            } else {
                setCurrentStep(nextStep);
                toast.success('Progress saved!');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Failed to save progress:', error);
            toast.error('Failed to save progress');
        } finally {
            setIsSaving(false);
        }
    };

    const goBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const progress = ((currentStep) / 6) * 100;

    if (isLoadingProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to C•CAP!</h1>
                    <p className="text-gray-600">Let's get your profile set up.</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Step {currentStep} of 6</span>
                        <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Step Content */}
                <Card className="mb-6">
                    {currentStep === 1 && <Step1Personal formData={formData} handleInputChange={handleInputChange} handlePhoneChange={handlePhoneChange} handleProfilePictureUpload={handleProfilePictureUpload} isUploadingProfilePic={isUploadingProfilePic} validationErrors={validationErrors} />}
                    {currentStep === 2 && <Step2Address formData={formData} handleInputChange={handleInputChange} validationErrors={validationErrors} />}
                    {currentStep === 3 && <Step3Education formData={formData} handleInputChange={handleInputChange} validationErrors={validationErrors} />}
                    {currentStep === 4 && <Step4Experience formData={formData} handleInputChange={handleInputChange} validationErrors={validationErrors} />}
                    {currentStep === 5 && <Step5Availability formData={formData} handleInputChange={handleInputChange} validationErrors={validationErrors} />}
                    {currentStep === 6 && <Step6InterestsDocuments formData={formData} handleInputChange={handleInputChange} handleResumeUpload={handleResumeUpload} handleCredentialUpload={handleCredentialUpload} handleServSafeUpload={handleServSafeUpload} isUploadingResume={isUploadingResume} isUploadingCredential={isUploadingCredential} isUploadingServSafe={isUploadingServSafe} validationErrors={validationErrors} />}
                </Card>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center">
                    <Button
                        variant="outline"
                        onClick={goBack}
                        disabled={currentStep === 1 || isSaving}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>

                    <Button
                        onClick={() => saveAndContinue(currentStep === 6 ? 0 : currentStep + 1)}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isSaving ? 'Saving...' : currentStep === 6 ? (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                Complete Enrollment
                            </>
                        ) : (
                            <>
                                Save & Continue
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Step Components
function Step1Personal({ formData, handleInputChange, handlePhoneChange, handleProfilePictureUpload, isUploadingProfilePic, validationErrors }: any) {
    return (
        <>
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-blue-700">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Profile Picture */}
                <div>
                    <Label className="text-base mb-3 block">Profile Picture (Optional)</Label>
                    <div className="mt-2">
                        {formData.existingProfilePicture ? (
                            <div className="flex items-center gap-4">
                                <img src={formData.existingProfilePicture} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => document.getElementById('profile-pic-upload')?.click()}
                                    disabled={isUploadingProfilePic}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {isUploadingProfilePic ? 'Uploading...' : 'Change Photo'}
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                                    <Upload className="h-8 w-8 text-gray-400" />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => document.getElementById('profile-pic-upload')?.click()}
                                    disabled={isUploadingProfilePic}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {isUploadingProfilePic ? 'Uploading...' : 'Upload Photo'}
                                </Button>
                            </div>
                        )}
                        <input
                            id="profile-pic-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleProfilePictureUpload(e.target.files?.[0] || null)}
                        />
                    </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="firstName" className="text-base mb-3 block">First Name *</Label>
                        <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            required
                            className={validationErrors.firstName ? 'border-red-500' : ''}
                        />
                        {validationErrors.firstName && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="lastName" className="text-base mb-3 block">Last Name *</Label>
                        <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            required
                            className={validationErrors.lastName ? 'border-red-500' : ''}
                        />
                        {validationErrors.lastName && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
                        )}
                    </div>
                </div>

                <div>
                    <Label htmlFor="preferredName" className="text-base mb-3 block">Preferred Name (Optional)</Label>
                    <Input
                        id="preferredName"
                        value={formData.preferredName}
                        onChange={(e) => handleInputChange('preferredName', e.target.value)}
                    />
                </div>

                <div>
                    <Label htmlFor="dateOfBirth" className="text-base mb-3 block">Date of Birth *</Label>
                    <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        required
                        className={validationErrors.dateOfBirth ? 'border-red-500' : ''}
                    />
                    {validationErrors.dateOfBirth && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.dateOfBirth}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="phone" className="text-base mb-3 block">Phone Number *</Label>
                    <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="(123) 456-7890"
                        required
                        className={validationErrors.phone ? 'border-red-500' : ''}
                    />
                    {validationErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="ccapConnection" className="text-base mb-3 block">How are you connected to C•CAP? *</Label>
                    <Select value={formData.ccapConnection} onValueChange={(value) => handleInputChange('ccapConnection', value)}>
                        <SelectTrigger className={validationErrors.ccapConnection ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select your connection" />
                        </SelectTrigger>
                        <SelectContent>
                            {CCAP_CONNECTION_DROPDOWN_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {validationErrors.ccapConnection && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.ccapConnection}</p>
                    )}
                </div>
            </CardContent>
        </>
    );
}

function Step2Address({ formData, handleInputChange, validationErrors }: any) {
    return (
        <>
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-blue-700">Address & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <div>
                    <Label htmlFor="address" className="text-base mb-3 block">Street Address *</Label>
                    <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required
                        className={validationErrors.address ? 'border-red-500' : ''}
                    />
                    {validationErrors.address && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.address}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="addressLine2" className="text-base mb-3 block">Address Line 2 (Optional)</Label>
                    <Input
                        id="addressLine2"
                        value={formData.addressLine2}
                        onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                        placeholder="Apt, Suite, Unit, etc."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="city" className="text-base mb-3 block">City *</Label>
                        <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            required
                            className={validationErrors.city ? 'border-red-500' : ''}
                        />
                        {validationErrors.city && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="state" className="text-base mb-3 block">State *</Label>
                        <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                            <SelectTrigger className={validationErrors.state ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select State" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATES.map((state) => (
                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {validationErrors.state && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.state}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="zipCode" className="text-base mb-3 block">Zip Code *</Label>
                        <Input
                            id="zipCode"
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange('zipCode', e.target.value)}
                            required
                            className={validationErrors.zipCode ? 'border-red-500' : ''}
                        />
                        {validationErrors.zipCode && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.zipCode}</p>
                        )}
                    </div>
                </div>

                <div>
                    <Label className="text-base mb-3 block">Are you willing to relocate? *</Label>
                    <RadioGroup value={formData.willingToRelocate} onValueChange={(value) => handleInputChange('willingToRelocate', value)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="relocate-yes" />
                            <Label htmlFor="relocate-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="relocate-no" />
                            <Label htmlFor="relocate-no">No</Label>
                        </div>
                    </RadioGroup>
                    {validationErrors.willingToRelocate && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.willingToRelocate}</p>
                    )}
                </div>

                {formData.willingToRelocate === "Yes" && (
                    <div>
                        <Label className="text-base mb-3 block">Which states would you consider?</Label>
                        <MultiSelect
                            options={STATES_OPTIONS}
                            onValueChange={(values) => handleInputChange('relocationStates', values)}
                            defaultValue={formData.relocationStates}
                            placeholder="Select states..."
                        />
                        {validationErrors.relocationStates && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.relocationStates}</p>
                        )}
                    </div>
                )}
            </CardContent>
        </>
    );
}

function Step3Education({ formData, handleInputChange, validationErrors }: any) {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => (currentYear - 5 + i).toString());

    return (
        <>
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-blue-700">Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <div>
                    <Label htmlFor="highSchool" className="text-base mb-3 block">Name of High School/Culinary School *</Label>
                    <Input
                        id="highSchool"
                        value={formData.highSchool}
                        onChange={(e) => handleInputChange('highSchool', e.target.value)}
                        required
                        className={validationErrors.highSchool ? 'border-red-500' : ''}
                    />
                    {validationErrors.highSchool && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.highSchool}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="culinaryTeacher" className="text-base mb-3 block">Who is your culinary teacher? *</Label>
                    <Input
                        id="culinaryTeacher"
                        value={formData.culinaryTeacher}
                        onChange={(e) => handleInputChange('culinaryTeacher', e.target.value)}
                        required
                        className={validationErrors.culinaryTeacher ? 'border-red-500' : ''}
                    />
                    {validationErrors.culinaryTeacher && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.culinaryTeacher}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="graduationYear" className="text-base mb-3 block">Expected Graduation Year *</Label>
                    <Select value={formData.graduationYear} onValueChange={(value) => handleInputChange('graduationYear', value)}>
                        <SelectTrigger className={validationErrors.graduationYear ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {validationErrors.graduationYear && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.graduationYear}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="culinaryClassYears" className="text-base mb-3 block">Years in Culinary Program *</Label>
                    <Input
                        id="culinaryClassYears"
                        type="text"
                        value={formData.culinaryClassYears}
                        onChange={(e) => {
                            const value = e.target.value;
                            // Only allow numbers
                            if (value === '' || /^\d+$/.test(value)) {
                                handleInputChange('culinaryClassYears', parseInt(value) || 0);
                            }
                        }}
                        placeholder="Enter number of years"
                        required
                        className={validationErrors.culinaryClassYears ? 'border-red-500' : ''}
                    />
                    {validationErrors.culinaryClassYears && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.culinaryClassYears}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="transportation" className="text-base mb-3 block">Method of transportation to a job. *</Label>
                    <Select value={formData.transportation} onValueChange={(value) => handleInputChange('transportation', value)}>
                        <SelectTrigger className={validationErrors.transportation ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select Transportation" />
                        </SelectTrigger>
                        <SelectContent>
                            {TRANSPORTATION_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {validationErrors.transportation && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.transportation}</p>
                    )}
                </div>
            </CardContent>
        </>
    );
}

function Step4Experience({ formData, handleInputChange, validationErrors }: any) {
    return (
        <>
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-blue-700">Work Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Current Employment */}
                <div>
                    <Label className="text-base mb-3 block">Are you currently employed full-time or part-time? *</Label>
                    <RadioGroup value={formData.currentlyEmployed} onValueChange={(value) => handleInputChange('currentlyEmployed', value)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="employed-yes" />
                            <Label htmlFor="employed-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="employed-no" />
                            <Label htmlFor="employed-no">No</Label>
                        </div>
                    </RadioGroup>
                    {validationErrors.currentlyEmployed && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.currentlyEmployed}</p>
                    )}
                </div>

                {formData.currentlyEmployed === "Yes" && (
                    <>
                        <div>
                            <Label htmlFor="currentEmployer" className="text-base mb-3 block">Current Employer *</Label>
                            <Input
                                id="currentEmployer"
                                value={formData.currentEmployer}
                                onChange={(e) => handleInputChange('currentEmployer', e.target.value)}
                                className={validationErrors.currentEmployer ? 'border-red-500' : ''}
                            />
                            {validationErrors.currentEmployer && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.currentEmployer}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="currentPosition" className="text-base mb-3 block">Current Position *</Label>
                            <Input
                                id="currentPosition"
                                value={formData.currentPosition}
                                onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                                className={validationErrors.currentPosition ? 'border-red-500' : ''}
                            />
                            {validationErrors.currentPosition && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.currentPosition}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="currentHoursPerWeek" className="text-base mb-3 block">Hours Per Week *</Label>
                            <Input
                                id="currentHoursPerWeek"
                                type="text"
                                value={formData.currentHoursPerWeek}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Only allow numbers
                                    if (value === '' || /^\d+$/.test(value)) {
                                        handleInputChange('currentHoursPerWeek', parseInt(value) || 0);
                                    }
                                }}
                                placeholder="Enter hours per week"
                                className={validationErrors.currentHoursPerWeek ? 'border-red-500' : ''}
                            />
                            {validationErrors.currentHoursPerWeek && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.currentHoursPerWeek}</p>
                            )}
                        </div>
                    </>
                )}

                {/* Previous Employment */}
                <div className="pt-4 border-t">
                    <Label className="text-base mb-3 block">Have you had previous employment full-time or part-time? *</Label>
                    <RadioGroup value={formData.previousEmployment} onValueChange={(value) => handleInputChange('previousEmployment', value)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="prev-employed-yes" />
                            <Label htmlFor="prev-employed-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="prev-employed-no" />
                            <Label htmlFor="prev-employed-no">No</Label>
                        </div>
                    </RadioGroup>
                    {validationErrors.previousEmployment && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.previousEmployment}</p>
                    )}
                </div>

                {formData.previousEmployment === "Yes" && (
                    <>
                        <div>
                            <Label htmlFor="previousEmployer" className="text-base mb-3 block">Previous Employer *</Label>
                            <Input
                                id="previousEmployer"
                                value={formData.previousEmployer}
                                onChange={(e) => handleInputChange('previousEmployer', e.target.value)}
                                className={validationErrors.previousEmployer ? 'border-red-500' : ''}
                            />
                            {validationErrors.previousEmployer && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.previousEmployer}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="previousPosition" className="text-base mb-3 block">Previous Position *</Label>
                            <Input
                                id="previousPosition"
                                value={formData.previousPosition}
                                onChange={(e) => handleInputChange('previousPosition', e.target.value)}
                                className={validationErrors.previousPosition ? 'border-red-500' : ''}
                            />
                            {validationErrors.previousPosition && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.previousPosition}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="previousHoursPerWeek" className="text-base mb-3 block">Hours Per Week *</Label>
                            <Input
                                id="previousHoursPerWeek"
                                type="text"
                                value={formData.previousHoursPerWeek}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Only allow numbers
                                    if (value === '' || /^\d+$/.test(value)) {
                                        handleInputChange('previousHoursPerWeek', parseInt(value) || 0);
                                    }
                                }}
                                placeholder="Enter hours per week"
                                className={validationErrors.previousHoursPerWeek ? 'border-red-500' : ''}
                            />
                            {validationErrors.previousHoursPerWeek && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.previousHoursPerWeek}</p>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </>
    );
}

function Step5Availability({ formData, handleInputChange, validationErrors }: any) {
    return (
        <>
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-blue-700">Availability & Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <div>
                    <Label htmlFor="hoursPerWeek" className="text-base mb-3 block">Desired Hours Per Week *</Label>
                    <Input
                        id="hoursPerWeek"
                        type="text"
                        value={formData.hoursPerWeek}
                        onChange={(e) => {
                            const value = e.target.value;
                            // Only allow numbers
                            if (value === '' || /^\d+$/.test(value)) {
                                handleInputChange('hoursPerWeek', parseInt(value) || 0);
                            }
                        }}
                        placeholder="Enter desired hours per week"
                        required
                        className={validationErrors.hoursPerWeek ? 'border-red-500' : ''}
                    />
                    {validationErrors.hoursPerWeek && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.hoursPerWeek}</p>
                    )}
                </div>

                <div>
                    <Label className="text-base mb-3 block">When are you available to work? * (Select all that apply)</Label>
                    <div className="space-y-2">
                        {AVAILABILITY_OPTIONS.map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`availability-${option}`}
                                    checked={formData.availability.includes(option)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            handleInputChange('availability', [...formData.availability, option]);
                                        } else {
                                            handleInputChange('availability', formData.availability.filter((v: string) => v !== option));
                                        }
                                    }}
                                />
                                <Label htmlFor={`availability-${option}`}>{option}</Label>
                            </div>
                        ))}
                    </div>
                    {validationErrors.availability && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.availability}</p>
                    )}
                </div>

                <div>
                    <Label className="text-base mb-3 block">Are you available on weekends? *</Label>
                    <RadioGroup value={formData.weekendAvailability} onValueChange={(value) => handleInputChange('weekendAvailability', value)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="weekend-yes" />
                            <Label htmlFor="weekend-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="weekend-no" />
                            <Label htmlFor="weekend-no">No</Label>
                        </div>
                    </RadioGroup>
                    {validationErrors.weekendAvailability && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.weekendAvailability}</p>
                    )}
                </div>

                <div>
                    <Label className="text-base mb-3 block">Are you ready to start work immediately? *</Label>
                    <RadioGroup value={formData.readyToWork} onValueChange={(value) => handleInputChange('readyToWork', value)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="ready-yes" />
                            <Label htmlFor="ready-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="ready-no" />
                            <Label htmlFor="ready-no">No</Label>
                        </div>
                    </RadioGroup>
                    {validationErrors.readyToWork && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.readyToWork}</p>
                    )}
                </div>

                {formData.readyToWork === "No" && (
                    <div>
                        <Label htmlFor="availableDate" className="text-base mb-3 block">When will you be available?</Label>
                        <Input
                            id="availableDate"
                            type="date"
                            value={formData.availableDate}
                            onChange={(e) => handleInputChange('availableDate', e.target.value)}
                        />
                    </div>
                )}
            </CardContent>
        </>
    );
}

function Step6InterestsDocuments({ formData, handleInputChange, handleResumeUpload, handleCredentialUpload, handleServSafeUpload, isUploadingResume, isUploadingCredential, isUploadingServSafe, validationErrors }: any) {
    return (
        <>
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-blue-700">Interests & Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Interests */}
                <div>
                    <Label className="text-base mb-3 block">Culinary Interests * (Select all that apply)</Label>
                    <div className="grid grid-cols-1 gap-2">
                        {CULINARY_INTEREST_OPTIONS.map((interest) => (
                            <div key={interest} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`interest-${interest}`}
                                    checked={formData.interests.includes(interest)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            handleInputChange('interests', [...formData.interests, interest]);
                                        } else {
                                            handleInputChange('interests', formData.interests.filter((v: string) => v !== interest));
                                        }
                                    }}
                                />
                                <Label htmlFor={`interest-${interest}`}>{interest}</Label>
                            </div>
                        ))}
                    </div>
                    {validationErrors.interests && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.interests}</p>
                    )}
                </div>

                {/* Resume */}
                <div className="pt-4 border-t">
                    <Label className="text-base mb-3 block">Do you have a resume? *</Label>
                    <RadioGroup value={formData.hasResume} onValueChange={(value) => handleInputChange('hasResume', value)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="resume-yes" />
                            <Label htmlFor="resume-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="resume-no" />
                            <Label htmlFor="resume-no">No</Label>
                        </div>
                    </RadioGroup>
                    {validationErrors.hasResume && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.hasResume}</p>
                    )}

                    {formData.hasResume === "Yes" && (
                        <div className="mt-4">
                            {formData.existingResumeUrl ? (
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-green-600">Resume uploaded</span>
                                    <Button variant="outline" size="sm" onClick={() => document.getElementById('resume-upload')?.click()} disabled={isUploadingResume}>
                                        Change
                                    </Button>
                                </div>
                            ) : (
                                <Button variant="outline" onClick={() => document.getElementById('resume-upload')?.click()} disabled={isUploadingResume}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    {isUploadingResume ? 'Uploading...' : 'Upload Resume'}
                                </Button>
                            )}
                            <input
                                id="resume-upload"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                onChange={(e) => handleResumeUpload(e.target.files?.[0] || null)}
                            />
                            {validationErrors.resumeUpload && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.resumeUpload}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Food Handlers Card */}
                <div className="pt-4 border-t">
                    <Label className="text-base mb-3 block">Do you have a Food Handlers Card? *</Label>
                    <RadioGroup value={formData.hasFoodHandlersCard} onValueChange={(value) => handleInputChange('hasFoodHandlersCard', value)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="food-yes" />
                            <Label htmlFor="food-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="food-no" />
                            <Label htmlFor="food-no">No</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="In Progress" id="food-progress" />
                            <Label htmlFor="food-progress">In Progress</Label>
                        </div>
                    </RadioGroup>
                    {validationErrors.hasFoodHandlersCard && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.hasFoodHandlersCard}</p>
                    )}

                    {formData.hasFoodHandlersCard === "Yes" && (
                        <div className="mt-4">
                            {formData.existingFoodHandlersUrl ? (
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-green-600">Certificate uploaded</span>
                                    <Button variant="outline" size="sm" onClick={() => document.getElementById('credential-upload')?.click()} disabled={isUploadingCredential}>
                                        Change
                                    </Button>
                                </div>
                            ) : (
                                <Button variant="outline" onClick={() => document.getElementById('credential-upload')?.click()} disabled={isUploadingCredential}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    {isUploadingCredential ? 'Uploading...' : 'Upload Certificate'}
                                </Button>
                            )}
                            <input
                                id="credential-upload"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={(e) => handleCredentialUpload(e.target.files?.[0] || null)}
                            />
                            {validationErrors.foodHandlersCardUpload && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.foodHandlersCardUpload}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* ServSafe */}
                <div className="pt-4 border-t">
                    <Label className="text-base mb-3 block">Do you have ServSafe certification? *</Label>
                    <RadioGroup value={formData.hasServSafe} onValueChange={(value) => handleInputChange('hasServSafe', value)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Yes" id="serv-yes" />
                            <Label htmlFor="serv-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No" id="serv-no" />
                            <Label htmlFor="serv-no">No</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Expired" id="serv-expired" />
                            <Label htmlFor="serv-expired">Expired</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="In Progress" id="serv-progress" />
                            <Label htmlFor="serv-progress">In Progress</Label>
                        </div>
                    </RadioGroup>
                    {validationErrors.hasServSafe && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.hasServSafe}</p>
                    )}

                    {formData.hasServSafe === "Yes" && (
                        <div className="mt-4">
                            {formData.existingServSafeUrl ? (
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-green-600">Certificate uploaded</span>
                                    <Button variant="outline" size="sm" onClick={() => document.getElementById('servsafe-upload')?.click()} disabled={isUploadingServSafe}>
                                        Change
                                    </Button>
                                </div>
                            ) : (
                                <Button variant="outline" onClick={() => document.getElementById('servsafe-upload')?.click()} disabled={isUploadingServSafe}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    {isUploadingServSafe ? 'Uploading...' : 'Upload Certificate'}
                                </Button>
                            )}
                            <input
                                id="servsafe-upload"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={(e) => handleServSafeUpload(e.target.files?.[0] || null)}
                            />
                            {validationErrors.servSafeUpload && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.servSafeUpload}</p>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </>
    );
}

