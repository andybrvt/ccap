import Layout from '@/components/layout/StudentLayout';
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
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
  culinaryClassYears: number;
  preferredName2: string;
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
    culinaryYears: "2"
  }
];

export default function EditPortfolio() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const student = exampleData.find((u) => u.id === user?.id);

  // Initialize form data from existing student data
  const [formData, setFormData] = useState<PortfolioFormData>({
    submissionId: student?.submissionId || "",
    respondentId: student?.formId || "",
    submittedAt: student?.submissionDate || "",
    firstName: student?.firstName || "",
    lastName: student?.lastName || "",
    preferredName: student?.preferredName || "",
    emailAddress: student?.email || "",
    mailingAddress: student?.address || "",
    addressLine2: student?.address2 || "",
    city: student?.city || "",
    state: student?.state || "",
    zipCode: student?.zipCode || "",
    willingToRelocate: student?.willRelocate || "No",
    relocationStates: student?.relocationStates || [],
    dateOfBirth: student?.dateOfBirth || "",
    mobilePhoneNumber: student?.mobileNumber || "",
    culinarySchool: student?.highSchool || "",
    yearOfGraduation: parseInt(student?.graduationYear || "2025"),
    transportation: student?.transportation || "Own Car",
    hoursPerWeek: parseInt(student?.hoursWanted || "30"),
    availability: student?.availableTimes ? [student.availableTimes] : [],
    weekendAvailability: student?.availableWeekends || "No",
    currentlyEmployed: student?.currentJob || "No",
    currentWorkplace: student?.currentEmployer || "",
    currentPosition: student?.currentPosition || "",
    currentHoursPerWeek: student?.currentHours ? parseInt(student.currentHours) : null,
    previousEmployment: student?.pastJob || "No",
    previousWorkplace: student?.pastEmployer || "",
    previousPosition: student?.pastPosition || "",
    previousHoursPerWeek: student?.pastHours ? parseInt(student.pastHours) : null,
    hasResume: student?.hasResume || "No",
    resumeUpload: null,
    existingResumeUrl: student?.resumeUrl || "",
    readyToWork: student?.readyToWork || "Yes",
    availableDate: student?.readyDate || "",
    interests: student?.interestedOptions || [],
    hasFoodHandlersCard: student?.foodHandlersCard || "No",
    foodHandlersCardUpload: null,
    existingFoodHandlersUrl: "",
    hasServSafe: student?.servsafeCredentials || "No",
    culinaryClassYears: parseInt(student?.culinaryYears || "0"),
    preferredName2: student?.preferredName || ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Handle file upload
  const handleFileUpload = (field: keyof PortfolioFormData, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  // Handle removing existing documents
  const handleRemoveExistingDocument = (field: 'existingResumeUrl' | 'existingFoodHandlersUrl') => {
    setFormData(prev => ({
      ...prev,
      [field]: ""
    }));
  };

  // Form validation
  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.firstName.trim()) errors.push("First name is required");
    if (!formData.lastName.trim()) errors.push("Last name is required");
    if (!formData.emailAddress.trim()) errors.push("Email address is required");
    if (!formData.mailingAddress.trim()) errors.push("Mailing address is required");
    if (!formData.city.trim()) errors.push("City is required");
    if (!formData.state) errors.push("State is required");
    if (!formData.zipCode.trim()) errors.push("Zip code is required");
    if (!formData.dateOfBirth) errors.push("Date of birth is required");
    if (!formData.mobilePhoneNumber.trim()) errors.push("Mobile phone number is required");
    if (!formData.culinarySchool.trim()) errors.push("Culinary school is required");
    if (!formData.transportation) errors.push("Transportation method is required");
    if (!formData.availability.length) errors.push("At least one availability option is required");
    if (!formData.weekendAvailability) errors.push("Weekend availability is required");
    if (!formData.currentlyEmployed) errors.push("Current employment status is required");
    if (!formData.previousEmployment) errors.push("Previous employment status is required");
    if (!formData.hasResume) errors.push("Resume status is required");
    if (!formData.readyToWork) errors.push("Ready to work status is required");
    if (!formData.interests.length) errors.push("At least one interest is required");
    if (!formData.hasFoodHandlersCard) errors.push("Food handlers card status is required");
    if (!formData.hasServSafe) errors.push("ServSafe status is required");

    // Conditional validations
    if (["Yes", "Maybe"].includes(formData.willingToRelocate) && formData.relocationStates.length === 0) {
      errors.push("Please select at least one relocation state");
    }
    if (formData.currentlyEmployed === "Yes") {
      if (!formData.currentWorkplace.trim()) errors.push("Current workplace is required");
      if (!formData.currentPosition.trim()) errors.push("Current position is required");
      if (!formData.currentHoursPerWeek) errors.push("Current hours per week is required");
    }
    if (formData.previousEmployment === "Yes") {
      if (!formData.previousWorkplace.trim()) errors.push("Previous workplace is required");
      if (!formData.previousPosition.trim()) errors.push("Previous position is required");
      if (!formData.previousHoursPerWeek) errors.push("Previous hours per week is required");
    }
    if (formData.hasResume === "Yes" && !formData.resumeUpload && !formData.existingResumeUrl) {
      errors.push("Resume upload is required");
    }
    if (formData.readyToWork === "No" && !formData.availableDate) {
      errors.push("Available date is required when not ready to work");
    }
    if (formData.hasFoodHandlersCard === "Yes" && !formData.foodHandlersCardUpload && !formData.existingFoodHandlersUrl) {
      errors.push("Food handlers card upload is required");
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Here you would typically send the data to your backend
      console.log('Submitting form data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Portfolio updated successfully!",
        {
          description: "Your portfolio has been updated successfully.",
          duration: 5000,
        }
      );
      setLocation('/student/portfolio');
    } catch (error) {
      toast.error("Failed to update portfolio. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!student) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
              <p className="text-gray-600">No user found for this portfolio ID.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Portfolio</h1>
            <p className="text-gray-600">Update your information and preferences</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
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
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
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
                    value={formData.yearOfGraduation}
                    onChange={(e) => handleInputChange('yearOfGraduation', parseInt(e.target.value))}
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
                    value={formData.culinaryClassYears}
                    onChange={(e) => handleInputChange('culinaryClassYears', parseInt(e.target.value))}
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
                  <Select value={formData.transportation} onValueChange={(value) => handleInputChange('transportation', value)}>
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
                    value={formData.hoursPerWeek}
                    onChange={(e) => handleInputChange('hoursPerWeek', parseInt(e.target.value))}
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
                      onChange={(e) => handleInputChange('currentHoursPerWeek', parseInt(e.target.value))}
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
                      onChange={(e) => handleInputChange('previousHoursPerWeek', parseInt(e.target.value))}
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
                            onClick={() => window.open(formData.existingResumeUrl, '_blank')}
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
                  {(!formData.existingResumeUrl || formData.resumeUpload) && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        id="resumeUpload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => handleFileUpload('resumeUpload', e.target.files?.[0] || null)}
                      />
                      <label htmlFor="resumeUpload" className="cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload your resume</p>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 5MB</p>
                      </label>
                    </div>
                  )}
                  
                  {/* Show uploaded file preview */}
                  {formData.resumeUpload && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{formData.resumeUpload.name}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileUpload('resumeUpload', null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
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
                            onClick={() => window.open(formData.existingFoodHandlersUrl, '_blank')}
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
                  {(!formData.existingFoodHandlersUrl || formData.foodHandlersCardUpload) && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        id="foodHandlersCardUpload"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleFileUpload('foodHandlersCardUpload', e.target.files?.[0] || null)}
                      />
                      <label htmlFor="foodHandlersCardUpload" className="cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload your food handlers card</p>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                      </label>
                    </div>
                  )}
                  
                  {/* Show uploaded file preview */}
                  {formData.foodHandlersCardUpload && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{formData.foodHandlersCardUpload.name}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileUpload('foodHandlersCardUpload', null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/student/portfolio')}
            >
              Cancel
            </Button>
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
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
