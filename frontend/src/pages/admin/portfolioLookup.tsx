import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, GraduationCap, Search, User2, Award, Sparkles, Loader2 } from "lucide-react";
import Layout from "@/components/layout/AdminLayout";
import { api } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { toast } from "sonner";

// Student interface (from API) - matches actual response structure
interface Student {
    id: string;
    email: string;
    username: string;
    role: string;
    created_at: string;
    student_profile?: {  // Changed from 'profile' to 'student_profile' to match API
        user_id: string;
        first_name?: string;
        last_name?: string;
        preferred_name?: string;
        high_school?: string;
        graduation_year?: string;
        interests?: string[];
        city?: string;
        state?: string;
        zip_code?: string;
        address?: string;
        phone?: string;
        transportation?: string;
        hours_per_week?: number;
        availability?: string[];
        weekend_availability?: string;
        currently_employed?: string;
        current_employer?: string;
        current_position?: string;
        current_hours_per_week?: number;
        has_food_handlers_card?: string;
        has_servsafe?: string;
        culinary_class_years?: number;
        current_bucket?: string;
        [key: string]: any;
    };
}

// Old dummy data - REMOVED (now using API)
const exampleDataOLD: any[] = [
    {
        id: 1,
        submissionId: "JxDW8d",
        formId: "6r5BRY",
        submissionDate: "2024-09-10 19:38:29",
        firstName: "Taelyn",
        lastName: "Morton",
        preferredName: "",
        email: "goldannmorton@gmail.com",
        address: "14043 N 57th Way",
        address2: "",
        city: "Scottsdale",
        state: "AZ",
        zipCode: "85254",
        willRelocate: "No",
        relocationStates: [],
        dateOfBirth: "2008-10-01",
        mobileNumber: "16028317803",
        highSchool: "Paradise Valley Highschool",
        graduationYear: "2026",
        transportation: "I will drive myself",
        hoursWanted: "25",
        availableTimes: "Evening (2PM - 6PM)",
        availableWeekends: "Yes",
        hasResume: "No",
        resumeUrl: "https://storage.tally.so/private/Morton-Resume.pdf?id=MEDodk&accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ik1FRG9kayIsImZvcm1JZCI6Im1ZZGREcSIsImlhdCI6MTc0NjY0NDI4MX0.k0TkChgdfD7z4_0WZlMWap53E-1bE9q5t6CsKPb5Eh0&signature=ef97b8d0f622c45a7c8aa42937b1c2544dbb759d151deaada05fbd1a7b708b87",
        currentJob: "No",
        currentEmployer: "",
        currentPosition: "",
        currentHours: "",
        pastJob: "No",
        pastEmployer: "",
        pastPosition: "",
        pastHours: "",
        readyToWork: "Yes",
        readyDate: "",
        interestedOptions: ["Culinary", "Baking and Pastry"],
        foodHandlersCard: "Yes",
        servsafeCredentials: "",
        culinaryYears: "1"
    },
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
    },
    {
        id: 3,
        submissionId: "ZKYZev",
        formId: "yeka0x",
        submissionDate: "2024-09-10 19:39:32",
        firstName: "Elyse",
        lastName: "Chavez",
        preferredName: "",
        email: "elysemaria07@gmail.com",
        address: "4722 East Bell Rd, Apt. 2143",
        address2: "",
        city: "Phoenix",
        state: "AZ",
        zipCode: "85032",
        willRelocate: "No",
        relocationStates: [],
        dateOfBirth: "2007-05-01",
        mobileNumber: "16027626552",
        highSchool: "PVHS",
        graduationYear: "2025",
        transportation: "I will drive myself",
        hoursWanted: "25",
        availableTimes: "Evening (2PM - 6PM)",
        availableWeekends: "Yes",
        hasResume: "Yes",
        resumeUrl: "https://storage.tally.so/private/RUSSELL-JOHNSON-RESUME-2.docx?id=kN9MOe&accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImtOOU1PZSIsImZvcm1JZCI6Im1ZZGREcSIsImlhdCI6MTc0NjY0NDI4MX0.6LBqo8Y_BQ8mG-7MPpVbxRW-nVkk1I48I_rk2JktHUU&signature=a4866eeacacb23e1b02678c0c5bc3633b1fd93d8002620bc58af51dbdabd4cb2",
        currentJob: "Yes",
        currentEmployer: "QuikTrip",
        currentPosition: "Clerk",
        currentHours: "30",
        pastJob: "No",
        pastEmployer: "",
        pastPosition: "",
        pastHours: "",
        readyToWork: "No",
        readyDate: "2024-12-01",
        interestedOptions: ["Baking and Pastry"],
        foodHandlersCard: "Yes",
        servsafeCredentials: "",
        culinaryYears: "0"
    },
    {
        id: 4,
        submissionId: "r1LkgL",
        formId: "K8yj88",
        submissionDate: "2024-09-10 19:39:56",
        firstName: "Aiden",
        lastName: "Hancharik",
        preferredName: "",
        email: "wynterhancharik@gmail.com",
        address: "9415 N 32nd st",
        address2: "",
        city: "phoenix",
        state: "AZ",
        zipCode: "85028",
        willRelocate: "No",
        relocationStates: [],
        dateOfBirth: "2006-09-25",
        mobileNumber: "16028829770",
        highSchool: "paradise valley high school",
        graduationYear: "2025",
        transportation: "I will drive myself",
        hoursWanted: "34",
        availableTimes: "Evening (2PM - 6PM)",
        availableWeekends: "No",
        hasResume: "No",
        resumeUrl: "",
        currentJob: "No",
        currentEmployer: "",
        currentPosition: "",
        currentHours: "",
        pastJob: "No",
        pastEmployer: "",
        pastPosition: "",
        pastHours: "",
        readyToWork: "No",
        readyDate: "2025-12-25",
        interestedOptions: ["Culinary"],
        foodHandlersCard: "Yes",
        servsafeCredentials: "",
        culinaryYears: "2"
    },
    {
        id: 5,
        submissionId: "r1Lkgp",
        formId: "zWv6WR",
        submissionDate: "2024-09-10 19:40:00",
        firstName: "Ibrahim",
        lastName: "Haddad",
        preferredName: "",
        email: "ibrahimhaddad07@gmail.com",
        address: "3826 west fallen leaf lane",
        address2: "",
        city: "Glendale",
        state: "AZ",
        zipCode: "85310",
        willRelocate: "No",
        relocationStates: [],
        dateOfBirth: "2023-12-07",
        mobileNumber: "14802400020",
        highSchool: "3",
        graduationYear: "2025",
        transportation: "I will drive myself",
        hoursWanted: "16",
        availableTimes: "Morning (6AM - 10AM), Afternoon (10AM - 2PM)",
        availableWeekends: "Yes",
        hasResume: "Yes",
        resumeUrl: "",
        currentJob: "Yes",
        currentEmployer: "Slim chicken",
        currentPosition: "Qb1",
        currentHours: "10",
        pastJob: "No",
        pastEmployer: "",
        pastPosition: "",
        pastHours: "",
        readyToWork: "No",
        readyDate: "2024-12-27",
        interestedOptions: ["Culinary"],
        foodHandlersCard: "Yes",
        servsafeCredentials: "",
        culinaryYears: "3"
    },
    {
        id: 6,
        submissionId: "agEakW",
        formId: "O8yN8R",
        submissionDate: "2024-09-10 19:40:01",
        firstName: "Russell",
        lastName: "Johnson",
        preferredName: "",
        email: "russellpj55@gmail.com",
        address: "3056 E Siesta Lane",
        address2: "",
        city: "Phoenix",
        state: "AZ",
        zipCode: "85032",
        willRelocate: "No",
        relocationStates: [],
        dateOfBirth: "2007-04-21",
        mobileNumber: "16023612341",
        highSchool: "Paradise valley high school",
        graduationYear: "2025",
        transportation: "I will drive myself",
        hoursWanted: "40",
        availableTimes: "Evening (2PM - 6PM), Afternoon (10AM - 2PM)",
        availableWeekends: "Yes",
        hasResume: "Yes",
        resumeUrl: "https://storage.tally.so/private/RUSSELL-JOHNSON-RESUME-2.docx?id=kN9MOe&accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImtOOU1PZSIsImZvcm1JZCI6Im1ZZGREcSIsImlhdCI6MTc0NjY0NDI4MX0.6LBqo8Y_BQ8mG-7MPpVbxRW-nVkk1I48I_rk2JktHUU&signature=a4866eeacacb23e1b02678c0c5bc3633b1fd93d8002620bc58af51dbdabd4cb2",
        currentJob: "Yes",
        currentEmployer: "The Mighty Axe",
        currentPosition: "Axepert",
        currentHours: "40",
        pastJob: "Yes",
        pastEmployer: "Tj maxx",
        pastPosition: "Employee",
        pastHours: "30",
        readyToWork: "No",
        readyDate: "2025-04-21",
        interestedOptions: ["Culinary"],
        foodHandlersCard: "Yes",
        servsafeCredentials: "",
        culinaryYears: "3"
    },
    {
        id: 7,
        submissionId: "RaYVgv",
        formId: "745k1Z",
        submissionDate: "2024-09-10 19:40:06",
        firstName: "Amaree",
        lastName: "Vega",
        preferredName: "",
        email: "amareevega@gmail.com",
        address: "E Hartford ave 3529",
        address2: "",
        city: "Phoenix",
        state: "AZ",
        zipCode: "85032",
        willRelocate: "No",
        relocationStates: [],
        dateOfBirth: "2007-08-06",
        mobileNumber: "16023125383",
        highSchool: "Paradise Valley High School",
        graduationYear: "2025",
        transportation: "I will be dropped off",
        hoursWanted: "18",
        availableTimes: "Evening (2PM - 6PM)",
        availableWeekends: "No",
        hasResume: "No",
        resumeUrl: "",
        currentJob: "No",
        currentEmployer: "",
        currentPosition: "",
        currentHours: "",
        pastJob: "No",
        pastEmployer: "",
        pastPosition: "",
        pastHours: "",
        readyToWork: "No",
        readyDate: "2025-08-06",
        interestedOptions: ["Culinary", "Baking and Pastry"],
        foodHandlersCard: "Yes",
        servsafeCredentials: "",
        culinaryYears: "3"
    },
    {
        id: 8,
        submissionId: "LNY6yz",
        formId: "D0yGAR",
        submissionDate: "2024-09-10 19:40:13",
        firstName: "Aisha",
        lastName: "Preciado",
        preferredName: "",
        email: "ishapc222@gmail.con",
        address: "2950 E Greenway Rd",
        address2: "",
        city: "Phoenix",
        state: "AZ",
        zipCode: "85032",
        willRelocate: "No",
        relocationStates: [],
        dateOfBirth: "2008-02-02",
        mobileNumber: "14808098395",
        highSchool: "Paradise Valley High School",
        graduationYear: "2026",
        transportation: "I will be dropped off",
        hoursWanted: "23",
        availableTimes: "Evening (2PM - 6PM)",
        availableWeekends: "No",
        hasResume: "Yes",
        resumeUrl: "https://storage.tally.so/private/RUSSELL-JOHNSON-RESUME-2.docx?id=kN9MOe&accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImtOOU1PZSIsImZvcm1JZCI6Im1ZZGREcSIsImlhdCI6MTc0NjY0NDI4MX0.6LBqo8Y_BQ8mG-7MPpVbxRW-nVkk1I48I_rk2JktHUU&signature=a4866eeacacb23e1b02678c0c5bc3633b1fd93d8002620bc58af51dbdabd4cb2",
        currentJob: "Yes",
        currentEmployer: "Target",
        currentPosition: "Style",
        currentHours: "19",
        pastJob: "No",
        pastEmployer: "",
        pastPosition: "",
        pastHours: "",
        readyToWork: "No",
        readyDate: "2025-01-25",
        interestedOptions: ["Baking and Pastry"],
        foodHandlersCard: "Yes",
        servsafeCredentials: "",
        culinaryYears: "3"
    }
];


export default function PortfolioLookup() {
    const [search, setSearch] = useState("");
    const [, setLocation] = useLocation();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Debounced search effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search.length >= 2) {
                searchStudents();
            } else {
                setStudents([]);
                setHasSearched(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const searchStudents = async () => {
        try {
            setLoading(true);
            setHasSearched(true);
            const response = await api.get(API_ENDPOINTS.ADMIN_SEARCH_STUDENTS, {
                params: { q: search }
            });
            setStudents(response.data);
        } catch (error: any) {
            console.error('Search failed:', error);
            toast.error(error.response?.data?.detail || 'Failed to search students');
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    return (

        <Layout>
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="p-3 bg-blue-700 rounded-lg">
                                <User2 className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold text-blue-900">
                                Portfolio Lookup
                            </h1>
                        </div>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Search for any student to view their C•CAP portfolio, including contact details, interests, and more.
                        </p>
                        {/* Feature highlights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
                            <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
                                <Award className="w-4 h-4 text-blue-400" />
                                Student profiles
                            </div>
                            <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
                                <Search className="w-4 h-4 text-blue-400" />
                                Search by name or school
                            </div>
                            <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
                                <Sparkles className="w-4 h-4 text-blue-400" />
                                View portfolios
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-xl mx-auto mt-10 px-4">
                <h1 className="text-3xl font-bold mb-6 text-center hidden">Portfolio Lookup</h1>
                <div className="mb-8 flex items-center gap-2">
                    <Search className="w-5 h-5 text-gray-400" />
                    <Input
                        placeholder="Search by name, email, or school..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-white border-gray-200 text-gray-900"
                    />
                </div>
                {/* Loading State */}
                {loading && (
                    <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                        <p className="text-gray-600">Searching students...</p>
                    </div>
                )}

                {/* Empty State - Before Search */}
                {!loading && search.length < 2 && (
                    <div className="text-gray-500 text-center py-8">
                        <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p>Type at least 2 characters to search for a student.</p>
                        <p className="text-sm text-gray-400 mt-1">Search by name, email, or school</p>
                    </div>
                )}

                {/* Results */}
                {!loading && hasSearched && (
                    <div className="space-y-4 mt-4">
                        {students.map(student => (
                            <Card key={student.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-6">
                                        {/* Left - Avatar */}
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-500">
                                                {student.student_profile?.first_name && student.student_profile?.last_name
                                                    ? `${student.student_profile.first_name.charAt(0)}${student.student_profile.last_name.charAt(0)}`
                                                    : student.username?.substring(0, 2).toUpperCase() || 'ST'
                                                }
                                            </div>
                                        </div>

                                        {/* Center - Detailed Info */}
                                        <div className="flex-1 space-y-2">
                                            {/* Name and Email */}
                                            <div>
                                                <h3 className="text-xl font-bold text-blue-900">
                                                    {student.student_profile?.first_name && student.student_profile?.last_name
                                                        ? `${student.student_profile.first_name} ${student.student_profile.last_name}`
                                                        : student.username
                                                    }
                                                    {student.student_profile?.preferred_name && (
                                                        <span className="text-gray-500 ml-2 text-base font-normal">
                                                            ({student.student_profile.preferred_name})
                                                        </span>
                                                    )}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                                                    <Mail className="w-4 h-4 text-blue-400" /> {student.email}
                                                </div>
                                            </div>

                                            {/* Education Info - Always show if available */}
                                            {(student.student_profile?.high_school || student.student_profile?.graduation_year) && (
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <GraduationCap className="w-4 h-4 text-blue-400" />
                                                    <span>
                                                        {student.student_profile.high_school || 'High School'}
                                                        {student.student_profile.graduation_year && ` - Class of ${student.student_profile.graduation_year}`}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Interests - Always show if available */}
                                            {student.student_profile?.interests && student.student_profile.interests.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {student.student_profile.interests.map((interest, i) => (
                                                        <Badge key={i} variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-100">
                                                            {interest}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                        </div>

                                        {/* Right - View Portfolio Button */}
                                        <div className="flex-shrink-0">
                                            <Button
                                                onClick={() => setLocation(`/admin/portfolio/${student.id}`)}
                                                variant="default"
                                            >
                                                View Portfolio
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* No Results */}
                        {search.length >= 2 && students.length === 0 && (
                            <div className="text-center py-8">
                                <User2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">No students found</p>
                                <p className="text-sm text-gray-500 mt-1">Try searching with a different name, email, or school</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}
