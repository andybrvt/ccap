import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { PROGRAM_STAGE_OPTIONS, CHAPTER_DISH_DROPDOWN_OPTIONS } from '@/lib/constants';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, GraduationCap, Briefcase, Clock, FileCheck, Utensils, Shield, X, Pencil, Plus, Upload, Loader2, Trash2, Lock } from "lucide-react";
import Layout from "@/components/layout/StudentLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  featured_dish: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_private: boolean;
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

// Helper function to get bucket dot color
const getBucketDotColor = (bucket: string) => {
  switch (bucket) {
    case 'Pre-Apprentice Explorer':
      return 'bg-yellow-400';
    case 'Pre-Apprentice Candidate':
      return 'bg-orange-400';
    case 'Apprentice':
      return 'bg-blue-400';
    case 'Completed Pre-Apprentice':
      return 'bg-green-400';
    case 'Completed Apprentice':
      return 'bg-purple-400';
    case 'Not Active':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
};

export default function Portfolio() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Modal state for post popup
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Modal state for create post
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostDish, setNewPostDish] = useState('');
  const [newPostPrivate, setNewPostPrivate] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);


  // Fetch student profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || user.role !== 'student') return;

      try {
        setIsLoading(true);
        const response = await api.get(API_ENDPOINTS.STUDENT_GET_PROFILE);
        if (response.data) {
          setStudentProfile(response.data);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        setStudentProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Fetch user's posts
  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return;

      try {
        setLoadingPosts(true);
        const response = await api.get(`${API_ENDPOINTS.POSTS_GET_BY_USER}${user.id}`);

        setPosts(response.data);
      } catch (error) {
        console.error('Failed to load posts:', error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [user]);

  // Refresh posts
  const refreshPosts = async () => {
    if (!user) return;

    try {
      const response = await api.get(`${API_ENDPOINTS.POSTS_GET_BY_USER}${user.id}`);

      setPosts(response.data);
    } catch (error) {
      console.error('Failed to refresh posts:', error);
    }
  };

  // Create post handler
  const handleCreatePost = async () => {
    if (!newPostImage || !newPostCaption.trim() || !newPostDish) return;

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('image', newPostImage);
      formData.append('caption', newPostCaption);
      formData.append('featured_dish', newPostDish);
      formData.append('is_private', newPostPrivate.toString());

      await api.post(API_ENDPOINTS.POSTS_CREATE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Post created successfully!');

      // Reset form
      setCreatePostOpen(false);
      setNewPostImage(null);
      setNewPostCaption('');
      setNewPostDish('');
      setNewPostPrivate(false);
      setImagePreview(null);

      // Refresh posts
      refreshPosts();
    } catch (error: any) {
      console.error('Failed to create post:', error);
      toast.error(error.response?.data?.detail || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete post handler
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.delete(`${API_ENDPOINTS.POSTS_DELETE}${postId}`);
      toast.success('Post deleted successfully!');

      // Close modal if viewing deleted post
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(null);
      }

      // Refresh posts
      refreshPosts();
    } catch (error: any) {
      console.error('Failed to delete post:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete post');
    }
  };

  // Open post modal
  const handleOpenPost = async (post: Post) => {
    setSelectedPost(post);
  };

  // Navigate to portfolio (only if it's the current user)
  const handleNavigateToProfile = (userId: string) => {
    // Only allow navigation to own portfolio (stays on same page)
    if (user && String(user.id) === String(userId)) {
      // Already on own portfolio, no need to navigate
      return;
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

  // Document viewing handlers
  const handleViewResume = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.STUDENT_GET_RESUME_URL);
      if (response.data?.download_url) {
        window.open(response.data.download_url, '_blank');
      }
    } catch (error: any) {
      console.error('Failed to get resume URL:', error);
      alert('Failed to view resume. Please try again.');
    }
  };

  const handleViewCredential = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.STUDENT_GET_CREDENTIAL_URL);
      if (response.data?.download_url) {
        window.open(response.data.download_url, '_blank');
      }
    } catch (error: any) {
      console.error('Failed to get credential URL:', error);
      alert('Failed to view credential. Please try again.');
    }
  };

  const handleViewServSafe = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.STUDENT_GET_SERVSAFE_URL);
      if (response.data?.download_url) {
        window.open(response.data.download_url, '_blank');
      }
    } catch (error: any) {
      console.error('Failed to get ServSafe URL:', error);
      alert('Failed to view ServSafe certificate. Please try again.');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  // Show error state if no profile found
  if (!studentProfile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
              <p className="text-gray-600 mb-4">Your profile data could not be loaded.</p>
              <Button
                onClick={() => setLocation('/student/editPortfolio')}
                className="w-full"
              >
                Create Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6">
        {/* LinkedIn-style Bio */}
        <Card className="mb-8 shadow-lg border-blue-100">
          <CardContent className="p-8 relative">
            {/* Edit Button */}
            <Button
              size="sm"
              variant="outline"
              className="absolute top-4 right-4 z-10"
              onClick={() => setLocation('/student/editPortfolio')}
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar and Name */}
              <div className="flex flex-col items-center md:items-start md:w-1/3 bg-blue-50 rounded-xl p-6 mb-4 md:mb-0">
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-500 mb-4 border-4 border-blue-200 overflow-hidden">
                  {studentProfile.profile_picture_url ? (
                    <img
                      src={studentProfile.profile_picture_url}
                      alt={`${studentProfile.first_name} ${studentProfile.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    `${studentProfile.first_name?.charAt(0) || ''}${studentProfile.last_name?.charAt(0) || ''}`
                  )}
                </div>
                <h1 className="text-2xl font-bold text-blue-700 mb-1 text-center md:text-left">
                  {studentProfile.first_name} {studentProfile.last_name}
                  {studentProfile.preferred_name && (
                    <span className="text-lg text-blue-400 ml-2">({studentProfile.preferred_name})</span>
                  )}
                </h1>
                <div className="flex flex-wrap gap-2 mb-2 justify-center md:justify-start">
                  {studentProfile.interests?.map((option: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-100">
                      {option}
                    </Badge>
                  ))}
                </div>
                {/* Bucket Status */}
                <div className="flex justify-center md:justify-start mb-2">
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium ${getBucketStyling(studentProfile.current_bucket)}`}
                  >
                    {studentProfile.current_bucket || 'Pre-Apprentice Explorer'}
                  </Badge>
                </div>
                {/* Bio Section */}
                {studentProfile.bio && (
                  <div className="w-full mt-4 p-4 bg-white rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-700 leading-relaxed">{studentProfile.bio}</p>
                  </div>
                )}
              </div>

              {/* Main Info */}
              <div className="flex-1 flex flex-col gap-6">
                {/* Contact Row */}
                <div className="flex flex-wrap gap-4 text-blue-900 text-sm items-center">
                  <span className="flex items-center gap-1"><Mail className="w-4 h-4 text-blue-400" />{studentProfile.email || user?.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-blue-400" />{studentProfile.phone}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-blue-400" />{studentProfile.city}, {studentProfile.state}</span>
                </div>
                <hr className="my-2 border-blue-100" />
                {/* Education */}
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-blue-700 flex items-center gap-2 text-lg"><GraduationCap className="w-5 h-5 text-blue-500" />Education</span>
                  <span className="ml-7 text-blue-900 text-sm">
                    <span className="font-semibold text-blue-600">{studentProfile.high_school}</span> <span className="text-gray-500">({studentProfile.graduation_year})</span>
                  </span>
                  {studentProfile.ccap_connection && (
                    <span className="ml-7 text-blue-800 text-sm">
                      <span className="font-semibold text-blue-700">C-CAP Connection:</span> <span className="text-gray-900">{studentProfile.ccap_connection}</span>
                    </span>
                  )}
                </div>
                {/* Work */}
                <div className="flex flex-col gap-1 mt-2">
                  <span className="font-semibold text-green-700 flex items-center gap-2 text-lg"><Briefcase className="w-5 h-5 text-green-500" />Work</span>
                  <span className="ml-7 text-green-700 text-sm">
                    <span className="font-semibold">{studentProfile.currently_employed === "Yes" ? "Currently at" : "Not currently working"}</span>
                    <span className="text-gray-900">{studentProfile.currently_employed === "Yes" ? ` ${studentProfile.current_employer}` : ""}</span>
                  </span>
                  {studentProfile.previous_employment === "Yes" && (
                    <span className="ml-7 text-green-500 text-xs">Past: <span className="text-gray-700">{studentProfile.previous_position} at {studentProfile.previous_employer} ({studentProfile.previous_hours_per_week} hrs/week)</span></span>
                  )}
                  <span className="ml-7 text-green-600 text-xs">Culinary Exp: <span className="text-gray-900">{studentProfile.culinary_class_years} years</span></span>
                </div>
                {/* Credentials */}
                <div className="flex flex-col gap-1 mt-2">
                  <span className="font-semibold text-purple-700 flex items-center gap-2 text-lg"><FileCheck className="w-5 h-5 text-purple-500" />Credentials</span>
                  <div className="ml-7 flex flex-col gap-3 text-purple-900 text-sm">
                    {/* Resume */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <FileCheck className="w-4 h-4 text-purple-400" />
                        <span className="font-semibold text-purple-700">Resume:</span>
                        <span className="text-gray-900">{studentProfile.has_resume === "Yes" ? "Available" : "Not Provided"}</span>
                      </span>
                      {studentProfile.has_resume === "Yes" && studentProfile.resume_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleViewResume}
                          className="text-xs"
                        >
                          View
                        </Button>
                      )}
                    </div>

                    {/* Food Handlers Card */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Utensils className="w-4 h-4 text-purple-400" />
                        <span className="font-semibold text-purple-700">Food Handler:</span>
                        <span className="text-gray-900">{studentProfile.has_food_handlers_card || "Not Provided"}</span>
                      </span>
                      {studentProfile.has_food_handlers_card === "Yes" && studentProfile.food_handlers_card_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleViewCredential}
                          className="text-xs"
                        >
                          View
                        </Button>
                      )}
                    </div>

                    {/* ServSafe Certificate */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-purple-400" />
                        <span className="font-semibold text-purple-700">ServSafe:</span>
                        <span className="text-gray-900">{studentProfile.has_servsafe || "Not Provided"}</span>
                      </span>
                      {studentProfile.has_servsafe === "Yes" && studentProfile.servsafe_certificate_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleViewServSafe}
                          className="text-xs"
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                {/* Details */}
                <div className="flex flex-col gap-1 mt-4">
                  <span className="font-semibold text-blue-700 flex items-center gap-2 text-lg">Details</span>
                  <div className="ml-7 flex flex-col gap-y-1 text-xs text-gray-500 bg-blue-50 rounded-lg p-4 border border-blue-100 mt-1">
                    <span><span className="font-semibold text-blue-700">Date of Birth:</span> <span className="text-gray-900">{studentProfile.date_of_birth}</span></span>
                    <span><span className="font-semibold text-blue-700">Transportation:</span> <span className="text-gray-900">{studentProfile.transportation}</span></span>
                    <span><span className="font-semibold text-blue-700">Available Times:</span> <span className="text-gray-900">{studentProfile.availability?.join(", ")}</span></span>
                    <span><span className="font-semibold text-blue-700">Available Weekends:</span> <span className="text-gray-900">{studentProfile.weekend_availability}</span></span>
                    <span><span className="font-semibold text-blue-700">Ready to Work:</span> <span className="text-gray-900">{studentProfile.ready_to_work} {studentProfile.available_date && `(from ${studentProfile.available_date})`}</span></span>
                    <span><span className="font-semibold text-blue-700">Will Relocate:</span> <span className="text-gray-900">{studentProfile.willing_to_relocate} {studentProfile.relocation_states?.length > 0 && `(${studentProfile.relocation_states.join(", ")})`}</span></span>
                    <span><span className="font-semibold text-blue-700">Address:</span> <span className="text-gray-900">{studentProfile.address} {studentProfile.address_line2}</span></span>
                    <span><span className="font-semibold text-blue-700">Zip:</span> <span className="text-gray-900">{studentProfile.zip_code}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instagram-style Posts Grid */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-blue-700">Posts</h2>
          <Button
            onClick={() => setCreatePostOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>

        {loadingPosts ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 border border-blue-200 rounded-lg bg-blue-50">
            <p className="text-blue-600 mb-4">No posts yet. Share your culinary journey!</p>
            <Button
              onClick={() => setCreatePostOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Post
            </Button>
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
                {post.is_private && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full">
                    <Lock className="h-3 w-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
        {/* Post Modal */}
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

                {/* Right Side - Post Info */}
                <div className="md:w-2/5 flex flex-col bg-white">
                  {/* Post Header with Delete Button */}
                  <div className="p-4 border-b flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      {user?.username?.substring(0, 2).toUpperCase() || 'ST'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{user?.username || 'Student'}</span>
                        {selectedPost.is_private && (
                          <div className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                            <Lock className="h-3 w-3" />
                            <span>Private</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(selectedPost.created_at)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePost(selectedPost.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
                        {user?.username?.substring(0, 2).toUpperCase() || 'ST'}
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900">{user?.username || 'Student'} </span>
                        <span className="text-gray-900">{selectedPost.caption}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Create Post Modal */}
        <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
          <DialogContent className="max-w-md w-full">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Create New Post</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image-upload" className="text-sm font-medium">
                  Upload Image
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setNewPostImage(file);
                        const reader = new FileReader();
                        reader.onload = (e) => setImagePreview(e.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {imagePreview ? (
                      <div className="space-y-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto max-h-48 rounded-lg object-cover"
                        />
                        <p className="text-sm text-gray-600">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload an image</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Dish Selection */}
              <div className="space-y-2">
                <Label htmlFor="dish-select" className="text-sm font-medium">
                  Featured Dish *
                </Label>
                <Select value={newPostDish} onValueChange={setNewPostDish}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a chapter dish featured in this post" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHAPTER_DISH_DROPDOWN_OPTIONS.map(dish => (
                      <SelectItem key={dish.value} value={dish.value}>{dish.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Chapter Reflection Input */}
              <div className="space-y-2">
                <Label htmlFor="caption" className="text-sm font-medium">
                  Technique, Plating & Taste
                </Label>
                <Textarea
                  id="caption"
                  placeholder="Describe the technique, plating, and taste..."
                  value={newPostCaption}
                  onChange={(e) => setNewPostCaption(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Private Post Checkbox */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="private-post"
                    checked={newPostPrivate}
                    onChange={(e) => setNewPostPrivate(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="private-post" className="text-sm font-medium">
                    Make this post private (visible only to admins)
                  </Label>
                </div>
                <p className="text-xs text-gray-500">
                  Private posts will only be visible to administrators and will not appear in the community feed.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreatePostOpen(false);
                    setNewPostImage(null);
                    setNewPostCaption('');
                    setNewPostDish('');
                    setNewPostPrivate(false);
                    setImagePreview(null);
                  }}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPostImage || !newPostCaption.trim() || !newPostDish || submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

// Example data type based on Google Sheets structure
interface Submission extends Record<string, unknown> {
  id: number;
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
  bucket: string;
  profilePicture?: string;
  bio?: string;
}

// Only one dummy student (id=2)
const exampleData: Submission[] = [
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
    bucket: "Apprentice",
    profilePicture: "https://plus.unsplash.com/premium_photo-1687485794296-68f0d6e934bb?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bio: "Passionate culinary student with 2 years of experience in baking and pastry. Currently working at Yogurtini while pursuing my culinary education. I love experimenting with new recipes and techniques, and I'm excited to grow my skills in the culinary industry."
  }
];
