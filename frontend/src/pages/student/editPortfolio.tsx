import Layout from '@/components/layout/StudentLayout';
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MultiSelect } from "@/components/ui/multi-select";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { toast } from "sonner";

// Form data interface based on the schema
interface PortfolioFormData {
  submissionId: string;
  respondentId: string;
  submittedAt: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  emailAddress: string;
  mailingAddress: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  willingToRelocate: string;
  relocationStates: string[];
  dateOfBirth: string;
  mobilePhoneNumber: string;
  culinarySchool: string;
  yearOfGraduation: number;
  transportation: string;
  hoursPerWeek: number;
  availability: string[];
  weekendAvailability: string;
  currentlyEmployed: string;
  currentWorkplace: string;
  currentPosition: string;
  currentHoursPerWeek: number | null;
  previousEmployment: string;
  previousWorkplace: string;
  previousPosition: string;
  previousHoursPerWeek: number | null;
  hasResume: string;
  resumeUpload: File | null;
  existingResumeUrl: string;
  readyToWork: string;
  availableDate: string;
  interests: string[];
  hasFoodHandlersCard: string;
  foodHandlersCardUpload: File | null;
  existingFoodHandlersUrl: string;
  hasServSafe: string;
  servSafeUpload: File | null;
  existingServSafeUrl: string;
  culinaryClassYears: number;
  preferredName2: string;
  profilePicture: File | null;
  existingProfilePicture: string;
  bio: string;
}

// States array
const STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

// States options for MultiSelect
const STATES_OPTIONS = STATES.map(state => ({ value: state, label: state }));

// Transportation options
const TRANSPORTATION_OPTIONS = [
  "Own Car",
  "Public Transportation",
  "Walk",
  "Bicycle",
  "Carpool/Rideshare",
  "Other"
];

// Availability options
const AVAILABILITY_OPTIONS = [
  "Morning (6am-12pm)",
  "Afternoon (12pm-6pm)",
  "Evening (6pm-12am)",
  "Overnight (12am-6am)",
  "Flexible"
];

// Interest options
const INTEREST_OPTIONS = [
  "Line Cook",
  "Prep Cook",
  "Pastry Chef",
  "Sous Chef",
  "Kitchen Manager",
  "Catering",
  "Food Service",
  "Restaurant Management",
  "Culinary Instructor",
  "Food Truck Operations",
  "Private Chef",
  "Other"
];

// Example data (same as in portfolio.tsx)
const exampleData = [
  {
    id: 2,
    submissionId: "x1ylvJ",
    formId: "gWroN4",
    submissionDate: "2024-09-10 19:39:18",
    firstName: "Madison",
    lastName: "Yob",
    preferredName: "",
    email: "madisonyob13@gmail.com",
    address: "3728 East Taro lane",
    address2: "",
    city: "Phoenix",
    state: "CA",
    zipCode: "85050",
    willRelocate: "No",
    relocationStates: ["KY", "IA", "ID", "GA", "DE"],
    dateOfBirth: "2007-03-08",
    mobileNumber: "15205914355",
    highSchool: "Paradise Valley High School",
    graduationYear: "2025",
    transportation: "I will drive myself",
    hoursWanted: "30",
    availableTimes: "Evening (2PM - 6PM)",
    availableWeekends: "Yes",
    hasResume: "Yes",
    resumeUrl: "https://storage.tally.so/private/Morton-Resume.pdf?id=MEDodk&accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ik1FRG9kayIsImZvcm1JZCI6Im1ZZGREcSIsImlhdCI6MTc0NjY0NDI4MX0.k0TkChgdfD7z4_0WZlMWap53E-1bE9q5t6CsKPb5Eh0&signature=ef97b8d0f622c45a7c8aa42937b1c2544dbb759d151deaada05fbd1a7b708b87",
    currentJob: "Yes",
    currentEmployer: "Yogurtini",
    currentPosition: "Employee",
    currentHours: "20",
    pastJob: "No",
    pastEmployer: "",
    pastPosition: "",
    pastHours: "",
    readyToWork: "No",
    readyDate: "2025-03-08",
    interestedOptions: ["Baking and Pastry", "Culinary"],
    foodHandlersCard: "No",
    servsafeCredentials: "",
    culinaryYears: "2",
    profilePicture: "https://plus.unsplash.com/premium_photo-1687485794296-68f0d6e934bb?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bio: "Passionate culinary student with 2 years of experience in baking and pastry. Currently working at Yogurtini while pursuing my culinary education. I love experimenting with new recipes and techniques, and I'm excited to grow my skills in the culinary industry."
  }
];

export default function EditPortfolio() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [fullProfile, setFullProfile] = useState<any>(null);

  // Fetch full profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || user.role !== 'student') return;

      try {
        setIsLoadingProfile(true);
        const response = await api.get(API_ENDPOINTS.STUDENT_GET_PROFILE);
        if (response.data) {
          setFullProfile(response.data);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Profile might not exist yet (new user), that's okay
        setFullProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Initialize form data (empty initially, will be populated by useEffect)
  const [formData, setFormData] = useState<PortfolioFormData>({
    submissionId: "",
    respondentId: "",
    submittedAt: "",
    firstName: "",
    lastName: "",
    preferredName: "",
    emailAddress: user?.email || "",
    mailingAddress: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    willingToRelocate: "",
    relocationStates: [],
    dateOfBirth: "",
    mobilePhoneNumber: "",
    culinarySchool: "",
    yearOfGraduation: 0,
    transportation: "",
    hoursPerWeek: 0,
    availability: [],
    weekendAvailability: "",
    currentlyEmployed: "",
    currentWorkplace: "",
    currentPosition: "",
    currentHoursPerWeek: null,
    previousEmployment: "",
    previousWorkplace: "",
    previousPosition: "",
    previousHoursPerWeek: null,
    hasResume: "",
    resumeUpload: null,
    existingResumeUrl: "",
    readyToWork: "",
    availableDate: "",
    interests: [],
    hasFoodHandlersCard: "",
    foodHandlersCardUpload: null,
    existingFoodHandlersUrl: "",
    hasServSafe: "",
    servSafeUpload: null,
    existingServSafeUrl: "",
    culinaryClassYears: 0,
    preferredName2: "",
    profilePicture: null,
    existingProfilePicture: "",
    bio: ""
  });

  // Update form data when full profile loads
  useEffect(() => {
    if (fullProfile) {
      console.log('Loading profile data:', fullProfile); // Debug
      console.log('State from backend:', fullProfile.transportation); // Debug

      setFormData({
        submissionId: "",
        respondentId: "",
        submittedAt: "",
        firstName: fullProfile.first_name || "",
        lastName: fullProfile.last_name || "",
        preferredName: fullProfile.preferred_name || "",
        emailAddress: fullProfile.email || user?.email || "",
        mailingAddress: fullProfile.address || "",
        addressLine2: fullProfile.address_line2 || "",
        city: fullProfile.city || "",
        state: fullProfile.state || "",
        zipCode: fullProfile.zip_code || "",
        willingToRelocate: fullProfile.willing_to_relocate || "",
        relocationStates: fullProfile.relocation_states || [],
        dateOfBirth: fullProfile.date_of_birth || "",
        mobilePhoneNumber: fullProfile.phone || "",
        culinarySchool: fullProfile.high_school || "",
        yearOfGraduation: fullProfile.graduation_year ? parseInt(fullProfile.graduation_year) : 0,
        transportation: fullProfile.transportation || "",
        hoursPerWeek: fullProfile.hours_per_week || 0,
        availability: fullProfile.availability || [],
        weekendAvailability: fullProfile.weekend_availability || "",
        currentlyEmployed: fullProfile.currently_employed || "",
        currentWorkplace: fullProfile.current_employer || "",
        currentPosition: fullProfile.current_position || "",
        currentHoursPerWeek: fullProfile.current_hours_per_week || null,
        previousEmployment: fullProfile.previous_employment || "",
        previousWorkplace: fullProfile.previous_employer || "",
        previousPosition: fullProfile.previous_position || "",
        previousHoursPerWeek: fullProfile.previous_hours_per_week || null,
        hasResume: fullProfile.has_resume || "",
        resumeUpload: null,
        existingResumeUrl: fullProfile.resume_url || "",
        readyToWork: fullProfile.ready_to_work || "",
        availableDate: fullProfile.available_date || "",
        interests: fullProfile.interests || [],
        hasFoodHandlersCard: fullProfile.has_food_handlers_card || "",
        foodHandlersCardUpload: null,
        existingFoodHandlersUrl: fullProfile.food_handlers_card_url || "",
        hasServSafe: fullProfile.has_servsafe || "",
        servSafeUpload: null,
        existingServSafeUrl: fullProfile.servsafe_certificate_url || "",
        culinaryClassYears: fullProfile.culinary_class_years || 0,
        preferredName2: fullProfile.preferred_name || "",
        profilePicture: null,
        existingProfilePicture: fullProfile.profile_picture_url || "",
        bio: fullProfile.bio || ""
      });
    }
  }, [fullProfile, user]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // File upload states
  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isUploadingCredential, setIsUploadingCredential] = useState(false);
  const [isUploadingServSafe, setIsUploadingServSafe] = useState(false);

  // Handle form field changes
  const handleInputChange = (field: keyof PortfolioFormData, value: string | number | string[] | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle multi-select changes
  const handleMultiSelectChange = (field: keyof PortfolioFormData, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentValues = prev[field] as string[];
      if (checked) {
        return { ...prev, [field]: [...currentValues, value] };
      } else {
        return { ...prev, [field]: currentValues.filter(v => v !== value) };
      }
    });
  };

  // Handle profile picture upload to S3
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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.profile_picture_url) {
        // Update form data with the new URL
        setFormData(prev => ({
          ...prev,
          existingProfilePicture: response.data.profile_picture_url,
          profilePicture: null
        }));

        toast.success("Profile picture uploaded successfully!");
      } else {
        console.error('No profile_picture_url in response:', response.data);
        toast.error('Upload successful but no image URL returned');
      }
    } catch (error: any) {
      console.error('Failed to upload profile picture:', error);
      const errorMessage = error.response?.data?.detail || "Failed to upload profile picture";
      toast.error("Upload Failed", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsUploadingProfilePic(false);
    }
  };

  // Handle resume upload to S3
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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.resume_url) {
        console.log('Resume upload successful:', response.data.resume_url);
        // Update form data to show upload succeeded
        setFormData(prev => ({
          ...prev,
          existingResumeUrl: response.data.resume_url,
          resumeUpload: file,
          hasResume: "Yes"
        }));
        toast.success("Resume uploaded successfully!");
      } else {
        console.error('No resume_url in response:', response.data);
        toast.error('Upload successful but no resume URL returned');
      }
    } catch (error: any) {
      console.error('Failed to upload resume:', error);
      const errorMessage = error.response?.data?.detail || "Failed to upload resume";
      toast.error("Upload Failed", {
        description: errorMessage,
        duration: 5000,
      });
      // Clear the file on error
      setFormData(prev => ({ ...prev, resumeUpload: null }));
    } finally {
      setIsUploadingResume(false);
    }
  };

  // Handle credential (food handlers card) upload to S3
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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.food_handlers_card_url) {
        console.log('Food Handlers Card upload successful:', response.data.food_handlers_card_url);
        // Update form data to show upload succeeded
        setFormData(prev => ({
          ...prev,
          existingFoodHandlersUrl: response.data.food_handlers_card_url,
          foodHandlersCardUpload: file,
          hasFoodHandlersCard: "Yes"
        }));
        toast.success("Food Handlers Card uploaded successfully!");
      } else {
        console.error('No food_handlers_card_url in response:', response.data);
        toast.error('Upload successful but no certificate URL returned');
      }
    } catch (error: any) {
      console.error('Failed to upload credential:', error);
      const errorMessage = error.response?.data?.detail || "Failed to upload credential";
      toast.error("Upload Failed", {
        description: errorMessage,
        duration: 5000,
      });
      // Clear the file on error
      setFormData(prev => ({ ...prev, foodHandlersCardUpload: null }));
    } finally {
      setIsUploadingCredential(false);
    }
  };

  // Handle ServSafe certificate upload to S3
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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.servsafe_certificate_url) {
        console.log('ServSafe certificate upload successful:', response.data.servsafe_certificate_url);
        // Update form data to show upload succeeded
        setFormData(prev => ({
          ...prev,
          existingServSafeUrl: response.data.servsafe_certificate_url,
          servSafeUpload: file,
          hasServSafe: "Yes"
        }));
        toast.success("ServSafe certificate uploaded successfully!");
      } else {
        console.error('No servsafe_certificate_url in response:', response.data);
        toast.error('Upload successful but no certificate URL returned');
      }
    } catch (error: any) {
      console.error('Failed to upload ServSafe certificate:', error);
      const errorMessage = error.response?.data?.detail || "Failed to upload ServSafe certificate";
      toast.error("Upload Failed", {
        description: errorMessage,
        duration: 5000,
      });
      // Clear the file on error
      setFormData(prev => ({ ...prev, servSafeUpload: null }));
    } finally {
      setIsUploadingServSafe(false);
    }
  };

  // Handle viewing resume with signed URL
  const handleViewResume = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.STUDENT_GET_RESUME_URL);
      if (response.data?.download_url) {
        window.open(response.data.download_url, '_blank');
      }
    } catch (error: any) {
      console.error('Failed to get resume URL:', error);
      toast.error("Failed to view resume", {
        description: error.response?.data?.detail || "Could not generate download link",
        duration: 5000,
      });
    }
  };

  // Handle viewing credential with signed URL
  const handleViewCredential = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.STUDENT_GET_CREDENTIAL_URL);
      if (response.data?.download_url) {
        window.open(response.data.download_url, '_blank');
      }
    } catch (error: any) {
      console.error('Failed to get credential URL:', error);
      toast.error("Failed to view credential", {
        description: error.response?.data?.detail || "Could not generate download link",
        duration: 5000,
      });
    }
  };

  // Handle viewing ServSafe certificate with signed URL
  const handleViewServSafe = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.STUDENT_GET_SERVSAFE_URL);
      if (response.data?.download_url) {
        window.open(response.data.download_url, '_blank');
      }
    } catch (error: any) {
      console.error('Failed to get ServSafe URL:', error);
      toast.error("Failed to view ServSafe certificate", {
        description: error.response?.data?.detail || "Could not generate download link",
        duration: 5000,
      });
    }
  };

  // Handle removing existing documents
  const handleRemoveExistingDocument = async (field: 'existingResumeUrl' | 'existingFoodHandlersUrl' | 'existingServSafeUrl' | 'existingProfilePicture') => {
    try {
      // Determine which endpoint to call based on the field
      let endpoint = '';
      let fieldName = '';

      switch (field) {
        case 'existingProfilePicture':
          endpoint = API_ENDPOINTS.STUDENT_DELETE_PROFILE_PICTURE;
          fieldName = 'Profile picture';
          break;
        case 'existingResumeUrl':
          endpoint = API_ENDPOINTS.STUDENT_DELETE_RESUME;
          fieldName = 'Resume';
          break;
        case 'existingFoodHandlersUrl':
          endpoint = API_ENDPOINTS.STUDENT_DELETE_CREDENTIAL;
          fieldName = 'Food Handlers Card';
          break;
        case 'existingServSafeUrl':
          endpoint = API_ENDPOINTS.STUDENT_DELETE_SERVSAFE;
          fieldName = 'ServSafe certificate';
          break;
      }

      // Call the backend to delete
      await api.delete(endpoint);

      // Update local state to remove the URL
      setFormData(prev => ({
        ...prev,
        [field]: ""
      }));

      toast.success(`${fieldName} deleted successfully!`);
    } catch (error: any) {
      console.error('Failed to delete document:', error);
      const errorMessage = error.response?.data?.detail || "Failed to delete document";
      toast.error("Delete Failed", {
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  // Simplified form validation - only check absolute minimum required fields
  const validateForm = (): string[] => {
    const errors: string[] = [];

    // Only require the absolute minimum
    if (!formData.firstName.trim()) errors.push("First name is required");
    if (!formData.lastName.trim()) errors.push("Last name is required");
    if (!formData.emailAddress.trim()) errors.push("Email address is required");

    // Everything else is optional - users can fill it out later
    return errors;
  };


  // Handle form submission (validates + saves + marks complete)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();


    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsSubmitting(true);

    try {
      // Map frontend camelCase to backend snake_case
      const profileData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        preferred_name: formData.preferredName || null,
        email: formData.emailAddress,
        phone: formData.mobilePhoneNumber,
        bio: formData.bio || null,
        // Note: profile_picture_url is handled separately via upload endpoint
        date_of_birth: formData.dateOfBirth,

        // Address
        address: formData.mailingAddress,
        address_line2: formData.addressLine2 || null,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,

        // Relocation
        willing_to_relocate: formData.willingToRelocate,
        relocation_states: formData.relocationStates,

        // Education
        high_school: formData.culinarySchool,
        graduation_year: formData.yearOfGraduation.toString(),
        culinary_class_years: formData.culinaryClassYears,

        // Work Experience
        currently_employed: formData.currentlyEmployed,
        current_employer: formData.currentWorkplace || null,
        current_position: formData.currentPosition || null,
        current_hours_per_week: formData.currentHoursPerWeek,

        previous_employment: formData.previousEmployment,
        previous_employer: formData.previousWorkplace || null,
        previous_position: formData.previousPosition || null,
        previous_hours_per_week: formData.previousHoursPerWeek,

        // Availability & Work Preferences
        transportation: formData.transportation,
        hours_per_week: formData.hoursPerWeek,
        availability: formData.availability,
        weekend_availability: formData.weekendAvailability,
        ready_to_work: formData.readyToWork,
        available_date: formData.availableDate || null,

        // Documents - only status, not URLs (URLs are handled separately via upload endpoints)
        has_resume: formData.hasResume,
        has_food_handlers_card: formData.hasFoodHandlersCard,
        has_servsafe: formData.hasServSafe,

        // Interests
        interests: formData.interests,
      };


      // Save to backend
      const response = await api.put(API_ENDPOINTS.STUDENT_UPDATE_PROFILE, profileData);

      if (response.data) {
        // Refresh user data to get updated profile
        const userResponse = await api.get(API_ENDPOINTS.AUTH_ME);
        if (userResponse.data) {
          // Update user in localStorage and context
          localStorage.setItem("auth_user", JSON.stringify(userResponse.data));
          window.location.reload(); // Reload to update auth context
        }

        toast.success("Profile saved successfully!",
          {
            description: "Your profile has been updated and you can now access the platform.",
            duration: 5000,
          }
        );

        // Redirect to homepage after successful save
        setTimeout(() => {
          setLocation('/student');
        }, 1000);
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      const errorMessage = error.response?.data?.detail || "Failed to update profile. Please try again.";
      toast.error("Save Failed", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if not a student (shouldn't happen due to ProtectedRoute, but safety check)
  if (!user || user.role !== 'student') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
              <p className="text-gray-600">Only students can access this page.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Show loading while fetching profile
  if (isLoadingProfile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  // Check if this is first-time onboarding (reactive - checks current formData state)
  // If they haven't filled first/last name, they're in onboarding mode
  const isOnboarding = !formData.firstName?.trim() || !formData.lastName?.trim();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Onboarding Banner */}
        {isOnboarding && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-1">Welcome to C-CAP! 👋</h2>
            <p className="text-sm text-blue-700">
              Please complete all required fields (*) to access the platform and connect with opportunities.
              <br />
              <span className="font-medium mt-1 inline-block">You must fill out this form before exploring the platform.</span>
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isOnboarding ? 'Complete Your Profile' : 'Edit Portfolio'}
            </h1>
            <p className="text-gray-600">
              {isOnboarding
                ? 'Tell us about yourself to get started'
                : 'Update your information and preferences'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture and Bio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-blue-700">Profile Picture & Bio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Profile Picture Upload */}
                <div className="space-y-4">
                  <Label htmlFor="profilePicture">Profile Picture</Label>

                  <div className="flex flex-col items-center space-y-4">
                    {/* Hidden file input */}
                    <input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleProfilePictureUpload(e.target.files?.[0] || null)}
                      disabled={isUploadingProfilePic}
                    />

                    {/* Profile Picture Display */}
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center border-4 border-gray-200 shadow-lg">
                        {formData.existingProfilePicture ? (
                          <img
                            src={formData.existingProfilePicture}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : isUploadingProfilePic ? (
                          <div className="flex flex-col items-center justify-center text-blue-600">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-1"></div>
                            <span className="text-xs">Uploading...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-blue-400">
                            <Upload className="w-8 h-8 mb-1" />
                            <span className="text-xs">No Image</span>
                          </div>
                        )}
                      </div>

                      {/* Overlay with upload/change button */}
                      <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <label htmlFor="profilePicture" className="cursor-pointer">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="bg-white text-gray-900 hover:bg-gray-100"
                            onClick={() => document.getElementById('profilePicture')?.click()}
                            disabled={isUploadingProfilePic}
                          >
                            {isUploadingProfilePic ? 'Uploading...' : (formData.existingProfilePicture ? 'Change' : 'Upload')}
                          </Button>
                        </label>
                      </div>
                    </div>

                    {/* Upload status and remove button */}
                    <div className="flex flex-col items-center space-y-2">
                      {isUploadingProfilePic && (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-gray-600">Uploading...</span>
                        </div>
                      )}

                      {formData.existingProfilePicture && !isUploadingProfilePic && (
                        <>
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            Profile picture uploaded
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveExistingDocument('existingProfilePicture')}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove Current Picture
                          </Button>
                        </>
                      )}

                      {!formData.existingProfilePicture && !isUploadingProfilePic && (
                        <p className="text-xs text-gray-500 text-center">
                          Click the upload button above to add a profile picture
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio Input */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself, your culinary journey, and what you're passionate about..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-gray-500">Share your story, experience, and what makes you unique as a culinary professional.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-blue-700">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredName">Preferred Name</Label>
                  <Input
                    id="preferredName"
                    value={formData.preferredName}
                    onChange={(e) => handleInputChange('preferredName', e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailAddress">Email Address *</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobilePhoneNumber">Mobile Phone Number *</Label>
                  <Input
                    id="mobilePhoneNumber"
                    type="tel"
                    value={formData.mobilePhoneNumber}
                    onChange={(e) => handleInputChange('mobilePhoneNumber', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-blue-700">Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="mailingAddress">Mailing Address *</Label>
                <Input
                  id="mailingAddress"
                  value={formData.mailingAddress}
                  onChange={(e) => handleInputChange('mailingAddress', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                <Input
                  id="addressLine2"
                  value={formData.addressLine2}
                  onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select
                    key={formData.state || 'no-state'}
                    value={formData.state}
                    onValueChange={(value) => handleInputChange('state', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code *</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Label>Are you willing to relocate? *</Label>
                <RadioGroup value={formData.willingToRelocate} onValueChange={(value) => handleInputChange('willingToRelocate', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="relocate-yes" />
                    <Label htmlFor="relocate-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="relocate-no" />
                    <Label htmlFor="relocate-no">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Maybe" id="relocate-maybe" />
                    <Label htmlFor="relocate-maybe">Maybe</Label>
                  </div>
                </RadioGroup>
              </div>
              {["Yes", "Maybe"].includes(formData.willingToRelocate) && (
                <div className="space-y-2">
                  <Label>Please select one or more states that you are considering for relocation</Label>
                  <MultiSelect
                    options={STATES_OPTIONS}
                    onValueChange={(values) => handleInputChange('relocationStates', values)}
                    defaultValue={formData.relocationStates}
                    placeholder="Select relocation states"
                    maxCount={10}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-blue-700">Education Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="culinarySchool">High School/College where Culinary Classes were taken *</Label>
                  <Input
                    id="culinarySchool"
                    value={formData.culinarySchool}
                    onChange={(e) => handleInputChange('culinarySchool', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearOfGraduation">Year of Graduation *</Label>
                  <Input
                    id="yearOfGraduation"
                    type="number"
                    min="1950"
                    max="2030"
                    value={formData.yearOfGraduation || ""}
                    onChange={(e) => handleInputChange('yearOfGraduation', e.target.value ? parseInt(e.target.value) : 0)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="culinaryClassYears">How many years of Culinary Classes have you attended?</Label>
                  <Input
                    id="culinaryClassYears"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.culinaryClassYears || ""}
                    onChange={(e) => handleInputChange('culinaryClassYears', e.target.value ? parseInt(e.target.value) : 0)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-blue-700">Work Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="transportation">How will you get to work? *</Label>
                  <Select
                    key={formData.transportation || 'no-transport'}
                    value={formData.transportation}
                    onValueChange={(value) => handleInputChange('transportation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transportation" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSPORTATION_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hoursPerWeek">How many hours do you want to work per week? *</Label>
                  <Input
                    id="hoursPerWeek"
                    type="number"
                    min="10"
                    max="60"
                    value={formData.hoursPerWeek || ""}
                    onChange={(e) => handleInputChange('hoursPerWeek', e.target.value ? parseInt(e.target.value) : 0)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Availability *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`availability-${option}`}
                        checked={formData.availability.includes(option)}
                        onCheckedChange={(checked) =>
                          handleMultiSelectChange('availability', option, checked as boolean)
                        }
                      />
                      <Label htmlFor={`availability-${option}`} className="text-sm">{option}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <Label>Are you available to work during the weekends? *</Label>
                <RadioGroup value={formData.weekendAvailability} onValueChange={(value) => handleInputChange('weekendAvailability', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="weekend-yes" />
                    <Label htmlFor="weekend-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="weekend-no" />
                    <Label htmlFor="weekend-no">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sometimes" id="weekend-sometimes" />
                    <Label htmlFor="weekend-sometimes">Sometimes</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Current Employment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-blue-700">Current Employment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Do you currently have a job? *</Label>
                <RadioGroup value={formData.currentlyEmployed} onValueChange={(value) => handleInputChange('currentlyEmployed', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="current-yes" />
                    <Label htmlFor="current-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="current-no" />
                    <Label htmlFor="current-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
              {formData.currentlyEmployed === "Yes" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentWorkplace">Where do you work currently?</Label>
                    <Input
                      id="currentWorkplace"
                      value={formData.currentWorkplace}
                      onChange={(e) => handleInputChange('currentWorkplace', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentPosition">What is your current position?</Label>
                    <Input
                      id="currentPosition"
                      value={formData.currentPosition}
                      onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentHoursPerWeek">How many hours do you work per week?</Label>
                    <Input
                      id="currentHoursPerWeek"
                      type="number"
                      min="1"
                      max="80"
                      value={formData.currentHoursPerWeek || ""}
                      onChange={(e) => handleInputChange('currentHoursPerWeek', e.target.value ? parseInt(e.target.value) : null)}
                      required
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Previous Employment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-blue-700">Previous Employment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Have you had a job in the past? *</Label>
                <RadioGroup value={formData.previousEmployment} onValueChange={(value) => handleInputChange('previousEmployment', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="previous-yes" />
                    <Label htmlFor="previous-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="previous-no" />
                    <Label htmlFor="previous-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
              {formData.previousEmployment === "Yes" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="previousWorkplace">Where did you work before?</Label>
                    <Input
                      id="previousWorkplace"
                      value={formData.previousWorkplace}
                      onChange={(e) => handleInputChange('previousWorkplace', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previousPosition">What was your position?</Label>
                    <Input
                      id="previousPosition"
                      value={formData.previousPosition}
                      onChange={(e) => handleInputChange('previousPosition', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previousHoursPerWeek">How many hours did you work per week?</Label>
                    <Input
                      id="previousHoursPerWeek"
                      type="number"
                      min="1"
                      max="80"
                      value={formData.previousHoursPerWeek || ""}
                      onChange={(e) => handleInputChange('previousHoursPerWeek', e.target.value ? parseInt(e.target.value) : null)}
                      required
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents and Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-blue-700">Documents and Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Do you have a Resume? *</Label>
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
              </div>
              {formData.hasResume === "Yes" && (
                <div className="space-y-2">
                  <Label htmlFor="resumeUpload">Resume *</Label>

                  {/* Show existing resume if available */}
                  {formData.existingResumeUrl && !formData.resumeUpload && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Current Resume</p>
                            <p className="text-xs text-gray-500">PDF Document</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleViewResume}
                          >
                            View
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveExistingDocument('existingResumeUrl')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show upload area if no existing resume or after removal */}
                  {!formData.existingResumeUrl && !formData.resumeUpload && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        id="resumeUpload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => handleResumeUpload(e.target.files?.[0] || null)}
                        disabled={isUploadingResume}
                      />
                      <label htmlFor="resumeUpload" className="cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload your resume</p>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 5MB</p>
                      </label>
                    </div>
                  )}

                  {/* Show uploading state */}
                  {isUploadingResume && (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600">Uploading resume...</span>
                    </div>
                  )}

                  {/* Show uploaded file preview */}
                  {formData.resumeUpload && !isUploadingResume && (
                    <div className="flex items-center gap-2 mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">{formData.resumeUpload.name}</Badge>
                      <span className="text-xs text-green-700 ml-auto">✓ Uploaded</span>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-4">
                <Label>Do you have a Food Handlers Card? *</Label>
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
              </div>
              {formData.hasFoodHandlersCard === "Yes" && (
                <div className="space-y-2">
                  <Label htmlFor="foodHandlersCardUpload">Food Handlers Card *</Label>

                  {/* Show existing food handlers card if available */}
                  {formData.existingFoodHandlersUrl && !formData.foodHandlersCardUpload && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Current Food Handlers Card</p>
                            <p className="text-xs text-gray-500">Document</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleViewCredential}
                          >
                            View
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveExistingDocument('existingFoodHandlersUrl')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show upload area if no existing card or after removal */}
                  {!formData.existingFoodHandlersUrl && !formData.foodHandlersCardUpload && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        id="foodHandlersCardUpload"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleCredentialUpload(e.target.files?.[0] || null)}
                        disabled={isUploadingCredential}
                      />
                      <label htmlFor="foodHandlersCardUpload" className="cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload your food handlers card</p>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                      </label>
                    </div>
                  )}

                  {/* Show uploading state */}
                  {isUploadingCredential && (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600">Uploading credential...</span>
                    </div>
                  )}

                  {/* Show uploaded file preview */}
                  {formData.foodHandlersCardUpload && !isUploadingCredential && (
                    <div className="flex items-center gap-2 mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">{formData.foodHandlersCardUpload.name}</Badge>
                      <span className="text-xs text-green-700 ml-auto">✓ Uploaded</span>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-4">
                <Label>Do you have ServSafe credentials? *</Label>
                <RadioGroup value={formData.hasServSafe} onValueChange={(value) => handleInputChange('hasServSafe', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="servsafe-yes" />
                    <Label htmlFor="servsafe-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="servsafe-no" />
                    <Label htmlFor="servsafe-no">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Expired" id="servsafe-expired" />
                    <Label htmlFor="servsafe-expired">Expired</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="In Progress" id="servsafe-progress" />
                    <Label htmlFor="servsafe-progress">In Progress</Label>
                  </div>
                </RadioGroup>
              </div>
              {formData.hasServSafe === "Yes" && (
                <div className="space-y-2">
                  <Label htmlFor="servSafeUpload">ServSafe Certificate *</Label>

                  {/* Show existing servsafe certificate if available */}
                  {formData.existingServSafeUrl && !formData.servSafeUpload && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Current ServSafe Certificate</p>
                            <p className="text-xs text-gray-500">Document</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleViewServSafe}
                          >
                            View
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveExistingDocument('existingServSafeUrl')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show upload area if no existing certificate or after removal */}
                  {!formData.existingServSafeUrl && !formData.servSafeUpload && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        id="servSafeUpload"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleServSafeUpload(e.target.files?.[0] || null)}
                        disabled={isUploadingServSafe}
                      />
                      <label htmlFor="servSafeUpload" className="cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload your ServSafe certificate</p>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                      </label>
                    </div>
                  )}

                  {/* Show uploading state */}
                  {isUploadingServSafe && (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600">Uploading certificate...</span>
                    </div>
                  )}

                  {/* Show uploaded file preview */}
                  {formData.servSafeUpload && !isUploadingServSafe && (
                    <div className="flex items-center gap-2 mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">{formData.servSafeUpload.name}</Badge>
                      <span className="text-xs text-green-700 ml-auto">✓ Uploaded</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Work Readiness */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-blue-700">Work Readiness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Are you ready to work now? *</Label>
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
              </div>
              {formData.readyToWork === "No" && (
                <div className="space-y-2">
                  <Label htmlFor="availableDate">When will you be ready to work?</Label>
                  <Input
                    id="availableDate"
                    type="date"
                    value={formData.availableDate}
                    onChange={(e) => handleInputChange('availableDate', e.target.value)}
                    required
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-blue-700">Interests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Select the option(s) that you are interested in</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {INTEREST_OPTIONS.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`interest-${option}`}
                        checked={formData.interests.includes(option)}
                        onCheckedChange={(checked) =>
                          handleMultiSelectChange('interests', option, checked as boolean)
                        }
                      />
                      <Label htmlFor={`interest-${option}`} className="text-sm">{option}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-4 justify-end">
            {!isOnboarding && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/student/portfolio')}
              >
                Cancel
              </Button>
            )}

            {/* Save Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isOnboarding ? 'Complete Profile' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
