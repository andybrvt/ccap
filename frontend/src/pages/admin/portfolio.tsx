import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, GraduationCap, Briefcase, Clock, FileCheck, Utensils, Shield, X, Loader2, ArrowLeft, Pencil } from "lucide-react";
import Layout from "@/components/layout/AdminLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { api } from '@/lib/apiService';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { toast } from 'sonner';
import { PROGRAM_STAGE_OPTIONS } from '@/lib/constants';

interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  featured_dish: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_liked?: boolean;
  author?: {
    id: string;
    username: string;
    email: string;
  };
}

// Helper function to get bucket styling
const getBucketStyling = (bucket: string) => {
  switch (bucket) {
    case 'Pre-Apprentice Explorer':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'Pre-Apprentice Candidate':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Apprentice':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Completed Pre-Apprentice':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'Completed Apprentice':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Not Active':
      return 'bg-gray-50 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export default function Portfolio() {
  const [match, params] = useRoute("/admin/portfolio/:id");
  const [, setLocation] = useLocation();

  // Get query parameters from the actual browser URL (not the location route)
  const currentUrl = window.location.href;
  const urlObj = new URL(currentUrl);
  const searchParams = urlObj.searchParams;
  const [user, setUser] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Modal state for post popup
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Admin edit-profile state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

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
            culinaryTeacher: profile.culinary_teacher || "",
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
            ccapConnection: profile.ccap_connection || "",
            bucket: profile.current_bucket || "Pre-Apprentice Explorer",
            bio: profile.bio || "",
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
  }, [params?.id, reloadKey]);

  // Open the edit dialog seeded with the current profile values
  const handleOpenEdit = () => {
    if (!user) return;
    setEditForm({
      first_name: user.firstName,
      last_name: user.lastName,
      preferred_name: user.preferredName,
      phone: user.mobileNumber,
      date_of_birth: user.dateOfBirth,
      bio: user.bio,
      address: user.address,
      address_line2: user.address2,
      city: user.city,
      state: user.state,
      zip_code: user.zipCode,
      high_school: user.highSchool,
      culinary_teacher: user.culinaryTeacher,
      graduation_year: user.graduationYear,
      culinary_class_years: user.culinaryYears,
      ccap_connection: user.ccapConnection,
      currently_employed: user.currentJob,
      current_employer: user.currentEmployer,
      current_position: user.currentPosition,
      current_hours_per_week: user.currentHours,
      previous_employment: user.pastJob,
      previous_employer: user.pastEmployer,
      previous_position: user.pastPosition,
      previous_hours_per_week: user.pastHours,
      transportation: user.transportation,
      weekend_availability: user.availableWeekends,
      ready_to_work: user.readyToWork,
      available_date: user.readyDate,
      willing_to_relocate: user.willRelocate,
      relocation_states: user.relocationStates.join(", "),
    });
    setEditOpen(true);
  };

  const setField = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!user?.id) return;
    const intFields = ["culinary_class_years", "current_hours_per_week", "previous_hours_per_week"];
    const payload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(editForm)) {
      if (key === "relocation_states") {
        payload[key] = value.split(",").map((s) => s.trim()).filter(Boolean);
      } else if (intFields.includes(key)) {
        const n = parseInt(value, 10);
        if (!Number.isNaN(n)) payload[key] = n;
      } else {
        payload[key] = value;
      }
    }
    try {
      setSaving(true);
      await api.put(`${API_ENDPOINTS.ADMIN_GET_STUDENT}${user.id}/profile`, payload);
      toast.success('Profile updated');
      setEditOpen(false);
      setReloadKey((k) => k + 1);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile', {
        description: error?.response?.data?.detail || 'Please try again',
      });
    } finally {
      setSaving(false);
    }
  };

  // Fetch user's posts
  useEffect(() => {
    const fetchPosts = async () => {
      if (!params?.id) return;

      try {
        setLoadingPosts(true);
        const response = await api.get(`${API_ENDPOINTS.POSTS_GET_BY_USER}${params.id}`);
        setPosts(response.data);
      } catch (error) {
        console.error('Failed to load posts:', error);
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [params?.id]);

  // Open post modal and fetch comments
  const handleOpenPost = async (post: Post) => {
    setSelectedPost(post);

    // Fetch comments for this post
    try {
      setLoadingComments(true);
      const response = await api.get(`${API_ENDPOINTS.POSTS_GET_COMMENTS}${post.id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to load comments:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Navigate to student portfolio
  const handleNavigateToPortfolio = (userId: string) => {
    setLocation(`/admin/portfolio/${userId}`);
  };

  // Admin: view student documents via signed URLs
  const handleAdminViewResume = async () => {
    if (!user?.id) return;
    try {
      const response = await api.get(`${API_ENDPOINTS.ADMIN_GET_RESUME_URL}${user.id}/profile/resume`);
      if (response.data?.download_url) {
        window.open(response.data.download_url, '_blank');
      }
    } catch (error: any) {
      console.error('Failed to get resume URL:', error);
      toast.error('Failed to view resume', {
        description: error?.response?.data?.detail || 'Could not generate download link',
        duration: 5000,
      });
    }
  };

  const handleAdminViewCredential = async () => {
    if (!user?.id) return;
    try {
      const response = await api.get(`${API_ENDPOINTS.ADMIN_GET_CREDENTIAL_URL}${user.id}/profile/credential`);
      if (response.data?.download_url) {
        window.open(response.data.download_url, '_blank');
      }
    } catch (error: any) {
      console.error('Failed to get credential URL:', error);
      toast.error('Failed to view credential', {
        description: error?.response?.data?.detail || 'Could not generate download link',
        duration: 5000,
      });
    }
  };

  const handleAdminViewServSafe = async () => {
    if (!user?.id) return;
    try {
      const response = await api.get(`${API_ENDPOINTS.ADMIN_GET_SERVSAFE_URL}${user.id}/profile/servsafe`);
      if (response.data?.download_url) {
        window.open(response.data.download_url, '_blank');
      }
    } catch (error: any) {
      console.error('Failed to get ServSafe URL:', error);
      toast.error('Failed to view ServSafe certificate', {
        description: error?.response?.data?.detail || 'Could not generate download link',
        duration: 5000,
      });
    }
  };

  // Format date helper
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

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

  const handleBackToSubmissions = () => {
    // Reconstruct URL with query params (just page parameter)
    const queryString = searchParams.toString();
    setLocation(`/admin/submissions${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <Layout>
      <div className="max-w-8xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LinkedIn-style Bio - Fixed width on large screens */}
          <div className="lg:w-2/4">
            <div className="flex justify-end mb-3">
              <Button variant="outline" size="sm" onClick={handleOpenEdit} className="border-blue-300 text-blue-700 hover:bg-blue-50">
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
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
                    {/* Program Status */}
                    <div className="flex justify-center md:justify-start mb-2">
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${getBucketStyling(user.bucket)}`}
                      >
                        {user.bucket || 'Pre-Apprentice Explorer'}
                      </Badge>
                    </div>
                    {/* Bio Section */}
                    {user.bio && (
                      <div className="w-full mt-4 p-4 bg-white rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-700 leading-relaxed">{user.bio}</p>
                      </div>
                    )}
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
                      {user.culinaryTeacher && (
                        <span className="ml-7 text-blue-600 text-sm font-semibold">
                          Culinary Teacher: <span className="text-gray-700 font-normal">{user.culinaryTeacher}</span>
                        </span>
                      )}
                      {user.ccapConnection && (
                        <span className="ml-7 text-blue-600 text-sm font-semibold">
                          C•CAP Connection: <span className="text-gray-700 font-normal">{user.ccapConnection}</span>
                        </span>
                      )}
                      <span className="ml-7 text-blue-600 text-sm">Culinary Education: <span className="text-gray-900">{user.culinaryYears} years</span></span>
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
                    </div>
                    {/* Credentials */}
                    <div className="flex flex-col gap-1 mt-2">
                      <span className="font-semibold text-purple-700 flex items-center gap-2 text-lg"><FileCheck className="w-5 h-5 text-purple-500" />Credentials</span>
                      <div className="ml-7 flex flex-col gap-2 text-purple-900 text-sm">
                        <span className="flex items-center gap-1"><FileCheck className="w-4 h-4 text-purple-400" /><span className="font-semibold text-purple-700">Resume:</span> <span className="text-gray-900">
                          {user.hasResume === "Yes" ? (
                            <button onClick={handleAdminViewResume} className="underline text-blue-600 font-medium hover:text-blue-800 transition-colors">
                              View Resume
                            </button>
                          ) : (
                            "Not Provided"
                          )}
                        </span></span>
                        <span className="flex items-center gap-1"><Utensils className="w-4 h-4 text-purple-400" /><span className="font-semibold text-purple-700">Food Handler:</span> <span className="text-gray-900">
                          {user.foodHandlersCard === "Yes" ? (
                            <button onClick={handleAdminViewCredential} className="underline text-blue-600 font-medium hover:text-blue-800 transition-colors">View</button>
                          ) : (
                            user.foodHandlersCard || "No"
                          )}
                        </span></span>
                        <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-purple-400" /><span className="font-semibold text-purple-700">ServSafe:</span> <span className="text-gray-900">
                          {user.servsafeCredentials === "Yes" ? (
                            <button onClick={handleAdminViewServSafe} className="underline text-blue-600 font-medium hover:text-blue-800 transition-colors">View</button>
                          ) : (
                            user.servsafeCredentials || "No"
                          )}
                        </span></span>
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
                        <span><span className="font-semibold text-blue-700">Ready to Work:</span> <span className="text-gray-900">{user.readyToWork}</span></span>
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
                {loadingPosts ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12 border border-blue-200 rounded-lg bg-blue-50">
                    <p className="text-blue-600 mb-4">No posts yet.</p>
                    <p className="text-blue-500 text-sm">This student hasn't shared any posts.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {posts.map((post) => (
                      <button
                        key={post.id}
                        className="relative aspect-square bg-blue-100 rounded-lg overflow-hidden border border-blue-200 focus:outline-none group"
                        onClick={() => handleOpenPost(post)}
                        style={{ width: "100%" }}
                      >
                        <img src={post.image_url} alt="Post" className="object-cover w-full h-full hover:scale-105 transition-transform duration-200 cursor-pointer" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Edit Profile Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Student Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-2">
              {/* Personal */}
              <div>
                <h3 className="text-sm font-semibold text-blue-700 mb-3">Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label className="mb-1 block">First Name</Label><Input value={editForm.first_name || ""} onChange={(e) => setField("first_name", e.target.value)} /></div>
                  <div><Label className="mb-1 block">Last Name</Label><Input value={editForm.last_name || ""} onChange={(e) => setField("last_name", e.target.value)} /></div>
                  <div><Label className="mb-1 block">Preferred Name</Label><Input value={editForm.preferred_name || ""} onChange={(e) => setField("preferred_name", e.target.value)} /></div>
                  <div><Label className="mb-1 block">Phone</Label><Input value={editForm.phone || ""} onChange={(e) => setField("phone", e.target.value)} /></div>
                  <div><Label className="mb-1 block">Date of Birth</Label><Input placeholder="YYYY-MM-DD" value={editForm.date_of_birth || ""} onChange={(e) => setField("date_of_birth", e.target.value)} /></div>
                </div>
                <div className="mt-4"><Label className="mb-1 block">Bio</Label><Textarea rows={3} value={editForm.bio || ""} onChange={(e) => setField("bio", e.target.value)} /></div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-sm font-semibold text-blue-700 mb-3">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label className="mb-1 block">Address</Label><Input value={editForm.address || ""} onChange={(e) => setField("address", e.target.value)} /></div>
                  <div><Label className="mb-1 block">Address Line 2</Label><Input value={editForm.address_line2 || ""} onChange={(e) => setField("address_line2", e.target.value)} /></div>
                  <div><Label className="mb-1 block">City</Label><Input value={editForm.city || ""} onChange={(e) => setField("city", e.target.value)} /></div>
                  <div><Label className="mb-1 block">State</Label><Input value={editForm.state || ""} onChange={(e) => setField("state", e.target.value)} /></div>
                  <div><Label className="mb-1 block">Zip Code</Label><Input value={editForm.zip_code || ""} onChange={(e) => setField("zip_code", e.target.value)} /></div>
                </div>
              </div>

              {/* Education */}
              <div>
                <h3 className="text-sm font-semibold text-blue-700 mb-3">Education</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label className="mb-1 block">High School</Label><Input value={editForm.high_school || ""} onChange={(e) => setField("high_school", e.target.value)} /></div>
                  <div><Label className="mb-1 block">Culinary Teacher</Label><Input value={editForm.culinary_teacher || ""} onChange={(e) => setField("culinary_teacher", e.target.value)} /></div>
                  <div><Label className="mb-1 block">Graduation Year</Label><Input value={editForm.graduation_year || ""} onChange={(e) => setField("graduation_year", e.target.value)} /></div>
                  <div><Label className="mb-1 block">Culinary Class Years</Label><Input type="number" value={editForm.culinary_class_years || ""} onChange={(e) => setField("culinary_class_years", e.target.value)} /></div>
                  <div><Label className="mb-1 block">C•CAP Connection</Label><Input value={editForm.ccap_connection || ""} onChange={(e) => setField("ccap_connection", e.target.value)} /></div>
                </div>
              </div>

              {/* Work */}
              <div>
                <h3 className="text-sm font-semibold text-blue-700 mb-3">Work</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1 block">Currently Employed</Label>
                    <Select value={editForm.currently_employed || ""} onValueChange={(v) => setField("currently_employed", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label className="mb-1 block">Current Employer</Label><Input value={editForm.current_employer || ""} onChange={(e) => setField("current_employer", e.target.value)} /></div>
                  <div><Label className="mb-1 block">Current Position</Label><Input value={editForm.current_position || ""} onChange={(e) => setField("current_position", e.target.value)} /></div>
                  <div><Label className="mb-1 block">Current Hours / Week</Label><Input type="number" value={editForm.current_hours_per_week || ""} onChange={(e) => setField("current_hours_per_week", e.target.value)} /></div>
                  <div>
                    <Label className="mb-1 block">Past Employment</Label>
                    <Select value={editForm.previous_employment || ""} onValueChange={(v) => setField("previous_employment", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label className="mb-1 block">Past Employer</Label><Input value={editForm.previous_employer || ""} onChange={(e) => setField("previous_employer", e.target.value)} /></div>
                  <div><Label className="mb-1 block">Past Position</Label><Input value={editForm.previous_position || ""} onChange={(e) => setField("previous_position", e.target.value)} /></div>
                  <div><Label className="mb-1 block">Past Hours / Week</Label><Input type="number" value={editForm.previous_hours_per_week || ""} onChange={(e) => setField("previous_hours_per_week", e.target.value)} /></div>
                </div>
              </div>

              {/* Availability & Relocation */}
              <div>
                <h3 className="text-sm font-semibold text-blue-700 mb-3">Availability</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label className="mb-1 block">Transportation</Label><Input value={editForm.transportation || ""} onChange={(e) => setField("transportation", e.target.value)} /></div>
                  <div>
                    <Label className="mb-1 block">Available Weekends</Label>
                    <Select value={editForm.weekend_availability || ""} onValueChange={(v) => setField("weekend_availability", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem><SelectItem value="Sometimes">Sometimes</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1 block">Ready to Work</Label>
                    <Select value={editForm.ready_to_work || ""} onValueChange={(v) => setField("ready_to_work", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label className="mb-1 block">Available Date</Label><Input placeholder="YYYY-MM-DD" value={editForm.available_date || ""} onChange={(e) => setField("available_date", e.target.value)} /></div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Post Modal with Comments */}
        {selectedPost && (
          <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
            <DialogContent
              className="p-0 max-h-[95vh]"
              style={{ width: '95vw', maxWidth: 'none' }}
            >
              <div className="flex flex-col md:flex-row h-full">
                {/* Left Side - Image */}
                <div className="md:w-3/5 bg-black flex items-center justify-center">
                  <img
                    src={selectedPost.image_url}
                    alt="Post"
                    className="w-full h-auto max-h-[95vh] object-contain"
                  />
                </div>

                {/* Right Side - Comments */}
                <div className="md:w-2/5 flex flex-col bg-white">
                  {/* Post Header */}
                  <div className="p-4 border-b flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold cursor-pointer hover:bg-blue-200 transition-colors"
                      onClick={() => selectedPost.author?.id && handleNavigateToPortfolio(selectedPost.author.id)}
                    >
                      {selectedPost.author?.username?.substring(0, 2).toUpperCase() || user?.firstName?.charAt(0) || 'ST'}
                    </div>
                    <div className="flex-1">
                      <span
                        className="font-semibold text-gray-900 block cursor-pointer hover:underline"
                        onClick={() => selectedPost.author?.id && handleNavigateToPortfolio(selectedPost.author.id)}
                      >
                        {selectedPost.author?.username || `${user?.firstName} ${user?.lastName}` || 'Student'}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(selectedPost.created_at)}</span>
                    </div>
                  </div>

                  {/* Featured Dish */}
                  {selectedPost.featured_dish && (
                    <div className="p-4 border-b">
                      <div className="flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-orange-500" />
                        <span className="font-semibold text-gray-900">Featured Dish:</span>
                      </div>
                      <Badge variant="outline" className="mt-2 border-orange-200 text-sm bg-orange-50 text-orange-700">
                        {selectedPost.featured_dish}
                      </Badge>
                    </div>
                  )}

                  {/* Chapter Reflection */}
                  <div className="p-4 flex-1">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">
                        {selectedPost.author?.username?.substring(0, 2).toUpperCase() || user?.firstName?.charAt(0) || 'ST'}
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900">{selectedPost.author?.username || `${user?.firstName} ${user?.lastName}` || 'Student'} </span>
                        <span className="text-gray-900">{selectedPost.caption}</span>
                      </div>
                    </div>
                  </div>
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
  culinaryTeacher: string;
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
  bio: string;
  ccapConnection: string;
  bucket: string;
  id?: string;
}
