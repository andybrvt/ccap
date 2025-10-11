import React, { useState, useEffect } from 'react';
import { useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, GraduationCap, Briefcase, Clock, FileCheck, Utensils, Shield, X } from "lucide-react";
import Layout from "@/components/layout/AdminLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { api } from '@/lib/apiService';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { toast } from 'sonner';

export default function Portfolio() {
  const [match, params] = useRoute("/admin/portfolio/:id");
  const [user, setUser] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch student data on mount
  useEffect(() => {
    const fetchStudent = async () => {
      if (!params?.id) return;

      try {
        setIsLoading(true);
        const response = await api.get(`${API_ENDPOINTS.ADMIN_GET_STUDENT}${params.id}`);

        if (response.data) {
          const student = response.data;
          const profile = student.student_profile || {};

          // Transform backend data to match frontend interface
          const transformedStudent: Submission = {
            id: student.id,
            submissionId: student.id,
            formId: student.id,
            submissionDate: profile.created_at || student.created_at,
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            preferredName: profile.preferred_name || "",
            email: student.email || profile.email || "",
            address: profile.address || "",
            address2: profile.address_line2 || "",
            city: profile.city || "",
            state: profile.state || "",
            zipCode: profile.zip_code || "",
            willRelocate: profile.willing_to_relocate || "",
            relocationStates: profile.relocation_states || [],
            dateOfBirth: profile.date_of_birth || "",
            mobileNumber: profile.phone || "",
            highSchool: profile.high_school || "",
            graduationYear: profile.graduation_year || "",
            transportation: profile.transportation || "",
            hoursWanted: profile.hours_per_week?.toString() || "0",
            availableTimes: profile.availability?.join(", ") || "",
            availableWeekends: profile.weekend_availability || "",
            hasResume: profile.has_resume || "",
            resumeUrl: profile.resume_url || "",
            currentJob: profile.currently_employed || "",
            currentEmployer: profile.current_employer || "",
            currentPosition: profile.current_position || "",
            currentHours: profile.current_hours_per_week?.toString() || "",
            pastJob: profile.previous_employment || "",
            pastEmployer: profile.previous_employer || "",
            pastPosition: profile.previous_position || "",
            pastHours: profile.previous_hours_per_week?.toString() || "",
            readyToWork: profile.ready_to_work || "",
            readyDate: profile.available_date || "",
            interestedOptions: profile.interests || [],
            foodHandlersCard: profile.has_food_handlers_card || "",
            servsafeCredentials: profile.has_servsafe || "",
            culinaryYears: profile.culinary_class_years?.toString() || "0",
          };

          setUser(transformedStudent);
        }
      } catch (error) {
        console.error('Failed to fetch student:', error);
        toast.error('Failed to load student data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudent();
  }, [params?.id]);

  // Mock posts (replace with real data if available)
  const posts = [
    {
      url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80",
      caption: "First day at C-CAP!"
    },
    {
      url: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=600&q=80",
      caption: "Baking class fun."
    },
    {
      url: "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?auto=format&fit=crop&w=600&q=80",
      caption: "Teamwork in the kitchen."
    },
    {
      url: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=600&q=80",
      caption: "Trying a new recipe."
    },
    {
      url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80",
      caption: "Plating practice."
    },
    {
      url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80",
      caption: "Pastry perfection."
    },
    {
      url: "https://images.unsplash.com/photo-1571805529673-0f56b922b359?auto=format&fit=crop&w=600&q=80",
      caption: "Culinary competition day."
    },
    {
      url: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&w=600&q=80",
      caption: "Learning from the chef."
    },
    {
      url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80",
      caption: "Group project success."
    },
    {
      url: "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=600&q=80",
      caption: "Final presentation!"
    }
  ];

  // Modal state for post popup
  const [selectedPost, setSelectedPost] = useState<null | { url: string; caption: string }>(null);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading student profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6">
              <h1 className="text-2xl font-bold mb-2">Student Not Found</h1>
              <p className="text-gray-600">No student found for this portfolio ID.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-8xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LinkedIn-style Bio - Fixed width on large screens */}
          <div className="lg:w-2/4">
            <Card className="shadow-lg border-blue-100">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Avatar and Name */}
                  <div className="flex flex-col items-center md:items-start md:w-1/3 bg-blue-50 rounded-xl p-6 mb-4 md:mb-0">
                    <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-500 mb-4 border-4 border-blue-200">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                    <h1 className="text-2xl font-bold text-blue-700 mb-1 text-center md:text-left">
                      {user.firstName} {user.lastName}
                      {user.preferredName && (
                        <span className="text-lg text-blue-400 ml-2">({user.preferredName})</span>
                      )}
                    </h1>
                    <div className="flex flex-wrap gap-2 mb-2 justify-center md:justify-start">
                      {user.interestedOptions.map((option, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-100">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 flex flex-col gap-6">
                    {/* Contact Row */}
                    <div className="flex flex-wrap gap-4 text-blue-900 text-sm items-center">
                      <span className="flex items-center gap-1"><Mail className="w-4 h-4 text-blue-400" />{user.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-blue-400" />{user.mobileNumber}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-blue-400" />{user.city}, {user.state}</span>
                    </div>
                    <hr className="my-2 border-blue-100" />
                    {/* Education */}
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-blue-700 flex items-center gap-2 text-lg"><GraduationCap className="w-5 h-5 text-blue-500" />Education</span>
                      <span className="ml-7 text-blue-900 text-sm">
                        <span className="font-semibold text-blue-600">{user.highSchool}</span> <span className="text-gray-500">({user.graduationYear})</span>
                      </span>
                    </div>
                    {/* Work */}
                    <div className="flex flex-col gap-1 mt-2">
                      <span className="font-semibold text-green-700 flex items-center gap-2 text-lg"><Briefcase className="w-5 h-5 text-green-500" />Work</span>
                      <span className="ml-7 text-green-700 text-sm">
                        <span className="font-semibold">{user.currentJob === "Yes" ? "Currently at" : "Not currently working"}</span>
                        <span className="text-gray-900">{user.currentJob === "Yes" ? ` ${user.currentEmployer}` : ""}</span>
                      </span>
                      {user.pastJob === "Yes" && (
                        <span className="ml-7 text-green-500 text-xs">Past: <span className="text-gray-700">{user.pastPosition} at {user.pastEmployer} ({user.pastHours} hrs/week)</span></span>
                      )}
                      <span className="ml-7 text-green-600 text-xs">Culinary Exp: <span className="text-gray-900">{user.culinaryYears} years</span></span>
                    </div>
                    {/* Credentials */}
                    <div className="flex flex-col gap-1 mt-2">
                      <span className="font-semibold text-purple-700 flex items-center gap-2 text-lg"><FileCheck className="w-5 h-5 text-purple-500" />Credentials</span>
                      <div className="ml-7 flex flex-col gap-2 text-purple-900 text-sm">
                        <span className="flex items-center gap-1"><FileCheck className="w-4 h-4 text-purple-400" /><span className="font-semibold text-purple-700">Resume:</span> <span className="text-gray-900">{
                          user.hasResume === "Yes"
                            ? (user.resumeUrl && user.resumeUrl.trim() !== ""
                              ? <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 font-medium hover:text-blue-800 transition-colors">View Resume</a>
                              : "Not Available")
                            : "Not Provided"
                        }</span></span>
                        <span className="flex items-center gap-1"><Utensils className="w-4 h-4 text-purple-400" /><span className="font-semibold text-purple-700">Food Handler:</span> <span className="text-gray-900">{user.foodHandlersCard}</span></span>
                        <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-purple-400" /><span className="font-semibold text-purple-700">ServSafe:</span> <span className="text-gray-900">{user.servsafeCredentials || "No"}</span></span>
                      </div>
                    </div>
                    {/* Details */}
                    <div className="flex flex-col gap-1 mt-4">
                      <span className="font-semibold text-blue-700 flex items-center gap-2 text-lg">Details</span>
                      <div className="ml-7 flex flex-col gap-y-1 text-xs text-gray-500 bg-blue-50 rounded-lg p-4 border border-blue-100 mt-1">
                        <span><span className="font-semibold text-blue-700">Date of Birth:</span> <span className="text-gray-900">{user.dateOfBirth}</span></span>
                        <span><span className="font-semibold text-blue-700">Transportation:</span> <span className="text-gray-900">{user.transportation}</span></span>
                        <span><span className="font-semibold text-blue-700">Available Times:</span> <span className="text-gray-900">{user.availableTimes}</span></span>
                        <span><span className="font-semibold text-blue-700">Available Weekends:</span> <span className="text-gray-900">{user.availableWeekends}</span></span>
                        <span><span className="font-semibold text-blue-700">Ready to Work:</span> <span className="text-gray-900">{user.readyToWork} {user.readyDate && `(from ${user.readyDate})`}</span></span>
                        <span><span className="font-semibold text-blue-700">Will Relocate:</span> <span className="text-gray-900">{user.willRelocate} {user.relocationStates.length > 0 && `(${user.relocationStates.join(", ")})`}</span></span>
                        <span><span className="font-semibold text-blue-700">Address:</span> <span className="text-gray-900">{user.address} {user.address2}</span></span>
                        <span><span className="font-semibold text-blue-700">Zip:</span> <span className="text-gray-900">{user.zipCode}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instagram-style Posts Grid - Scrollable on large screens */}
          <div className="lg:w-2/4">
            <div className="lg:sticky lg:top-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-700">Posts</h2>
              <div className="lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-2">
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  {posts.map((post, i) => (
                    <button
                      key={i}
                      className="aspect-square bg-blue-100 rounded-lg overflow-hidden border border-blue-200 focus:outline-none"
                      onClick={() => setSelectedPost(post)}
                      style={{ width: "100%" }}
                    >
                      <img src={post.url} alt="Post" className="object-cover w-full h-full hover:scale-115 transition-transform duration-200 cursor-pointer" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Post Modal Popup */}
        {selectedPost && (
          <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
            <DialogContent className="max-w-md w-full p-0">
              <DialogHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-2 border-b">
                <DialogTitle className="text-lg font-semibold">Post</DialogTitle>

              </DialogHeader>
              <div className="flex flex-col items-center">
                <div className="w-full flex items-center justify-center bg-black/5" style={{ minHeight: '300px', maxHeight: '60vh' }}>
                  <img
                    src={selectedPost.url}
                    alt="Post"
                    className="object-contain max-h-[60vh] w-full rounded-none"
                    style={{ maxWidth: '100%' }}
                  />
                </div>
                <div className="p-4 w-full text-gray-800 text-base text-center break-words overflow-y-auto max-h-32">
                  {selectedPost.caption}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}

// Student data interface
interface Submission extends Record<string, unknown> {
  submissionId: string;
  formId: string;
  submissionDate: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  email: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  willRelocate: string;
  relocationStates: string[];
  dateOfBirth: string;
  mobileNumber: string;
  highSchool: string;
  graduationYear: string;
  transportation: string;
  hoursWanted: string;
  availableTimes: string;
  availableWeekends: string;
  hasResume: string;
  resumeUrl: string;
  currentJob: string;
  currentEmployer: string;
  currentPosition: string;
  currentHours: string;
  pastJob: string;
  pastEmployer: string;
  pastPosition: string;
  pastHours: string;
  readyToWork: string;
  readyDate: string;
  interestedOptions: string[];
  foodHandlersCard: string;
  servsafeCredentials: string;
  culinaryYears: string;
  id?: string;
}
