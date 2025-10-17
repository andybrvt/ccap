import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, GraduationCap, Briefcase, Clock, FileCheck, Utensils, Shield, X, Loader2 } from "lucide-react";
import Layout from "@/components/layout/AdminLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
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
  }, [params?.id]);

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
                      {user.ccapConnection && (
                        <span className="ml-7 text-blue-600 text-sm font-semibold">
                          CCAP Connection: <span className="text-gray-700 font-normal">{user.ccapConnection}</span>
                        </span>
                      )}
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
