import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, GraduationCap, Briefcase, Clock, FileCheck, Utensils, Shield, X, Pencil, Plus, Upload } from "lucide-react";
import Layout from "@/components/layout/StudentLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Portfolio() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Modal state for create post
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostDish, setNewPostDish] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
                    className={`text-xs font-medium ${studentProfile.current_bucket === 'Pre-Apprentice' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      studentProfile.current_bucket === 'Apprentice' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        studentProfile.current_bucket === 'Completed Pre-Apprentice' ? 'bg-green-50 text-green-700 border-green-200' :
                          studentProfile.current_bucket === 'Completed Apprentice' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                  >
                    {studentProfile.current_bucket || 'Pre-Apprentice'}
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

        {/* Bucket-based Content Section */}
        <Card className="mb-8 shadow-lg border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${studentProfile.current_bucket === 'Pre-Apprentice' ? 'bg-yellow-400' :
                studentProfile.current_bucket === 'Apprentice' ? 'bg-blue-400' :
                  studentProfile.current_bucket === 'Completed Pre-Apprentice' ? 'bg-green-400' :
                    studentProfile.current_bucket === 'Completed Apprentice' ? 'bg-purple-400' :
                      'bg-gray-400'
                }`}></div>
              <h2 className="text-xl font-semibold text-blue-700">Your Program Status</h2>
            </div>

            {studentProfile.current_bucket === 'Pre-Apprentice' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">Welcome to C-CAP Pre-Apprentice Program!</h3>
                  <p className="text-yellow-700 text-sm mb-3">
                    You're just starting your culinary journey. Here's what you need to know:
                  </p>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• Complete your basic culinary foundation courses</li>
                    <li>• Attend mandatory safety and food handling workshops</li>
                    <li>• Build your portfolio with 5+ culinary projects</li>
                    <li>• Network with industry professionals</li>
                  </ul>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Next Steps</h4>
                    <p className="text-sm text-gray-600">Complete your food handler certification and attend your first workshop by the end of this month.</p>
                  </div>
                  <div className="bg-white border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Resources</h4>
                    <p className="text-sm text-gray-600">Access your pre-apprentice handbook and safety guidelines in your student portal.</p>
                  </div>
                </div>
              </div>
            )}

            {studentProfile.current_bucket === 'Apprentice' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">C-CAP Apprentice Program</h3>
                  <p className="text-blue-700 text-sm mb-3">
                    You're actively building your culinary skills. Here's your current focus:
                  </p>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Advanced cooking techniques and recipe development</li>
                    <li>• Kitchen management and leadership skills</li>
                    <li>• Industry externships and real-world experience</li>
                    <li>• Professional networking and mentorship</li>
                  </ul>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Current Projects</h4>
                    <p className="text-sm text-gray-600">Working on advanced plating techniques and menu development for your final portfolio.</p>
                  </div>
                  <div className="bg-white border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Mentorship</h4>
                    <p className="text-sm text-gray-600">You've been paired with Chef Sarah Johnson for weekly mentoring sessions.</p>
                  </div>
                </div>
              </div>
            )}

            {studentProfile.current_bucket === 'Completed Pre-Apprentice' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Congratulations! Pre-Apprentice Complete</h3>
                  <p className="text-green-700 text-sm mb-3">
                    You've successfully completed the foundational phase. Here's what you've achieved:
                  </p>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>✓ Completed all safety and food handling certifications</li>
                    <li>✓ Built a strong foundation portfolio with 8+ projects</li>
                    <li>✓ Established industry connections and references</li>
                    <li>✓ Ready to advance to the Apprentice program</li>
                  </ul>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Achievements</h4>
                    <p className="text-sm text-gray-600">Earned your ServSafe certification and completed 12 culinary projects.</p>
                  </div>
                  <div className="bg-white border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Next Phase</h4>
                    <p className="text-sm text-gray-600">You're eligible to apply for the Apprentice program starting next semester.</p>
                  </div>
                </div>
              </div>
            )}

            {studentProfile.current_bucket === 'Completed Apprentice' && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">C-CAP Graduate - Apprentice Complete</h3>
                  <p className="text-purple-700 text-sm mb-3">
                    You've successfully completed the full C-CAP program! Here's your status:
                  </p>
                  <ul className="text-purple-700 text-sm space-y-1">
                    <li>✓ Completed advanced culinary training and externships</li>
                    <li>✓ Built a professional portfolio with 15+ projects</li>
                    <li>✓ Established strong industry connections and references</li>
                    <li>✓ Ready for professional culinary opportunities</li>
                  </ul>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2">Career Ready</h4>
                    <p className="text-sm text-gray-600">You have access to exclusive job placement services and industry networking events.</p>
                  </div>
                  <div className="bg-white border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2">Alumni Benefits</h4>
                    <p className="text-sm text-gray-600">Access to ongoing professional development and mentorship opportunities.</p>
                  </div>
                </div>
              </div>
            )}

            {studentProfile.current_bucket === 'Not Active' && (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Account Status: Not Active</h3>
                  <p className="text-gray-700 text-sm mb-3">
                    Your C-CAP account is currently inactive. Here's what you need to know:
                  </p>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Your account has been temporarily suspended</li>
                    <li>• Contact your program coordinator for reactivation</li>
                    <li>• Complete any outstanding requirements</li>
                    <li>• Update your contact information if needed</li>
                  </ul>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">Contact Support</h4>
                    <p className="text-sm text-gray-600">Reach out to your program coordinator to discuss reactivation options.</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">Requirements</h4>
                    <p className="text-sm text-gray-600">Review any outstanding requirements that need to be completed for reactivation.</p>
                  </div>
                </div>
              </div>
            )}
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

              {/* Caption Input */}
              <div className="space-y-2">
                <Label htmlFor="caption" className="text-sm font-medium">
                  Caption
                </Label>
                <Textarea
                  id="caption"
                  placeholder="Write a caption for your post..."
                  value={newPostCaption}
                  onChange={(e) => setNewPostCaption(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Dish Selection */}
              <div className="space-y-2">
                <Label htmlFor="dish-select" className="text-sm font-medium">
                  Featured Dish
                </Label>
                <Select value={newPostDish} onValueChange={setNewPostDish}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a dish featured in this post" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beef-wellington">Beef Wellington</SelectItem>
                    <SelectItem value="coq-au-vin">Coq au Vin</SelectItem>
                    <SelectItem value="risotto-milanese">Risotto Milanese</SelectItem>
                    <SelectItem value="bouillabaisse">Bouillabaisse</SelectItem>
                    <SelectItem value="beef-bourguignon">Beef Bourguignon</SelectItem>
                    <SelectItem value="ratatouille">Ratatouille</SelectItem>
                    <SelectItem value="paella">Paella</SelectItem>
                    <SelectItem value="osso-buco">Osso Buco</SelectItem>
                    <SelectItem value="cassoulet">Cassoulet</SelectItem>
                    <SelectItem value="souffle">Soufflé</SelectItem>
                  </SelectContent>
                </Select>
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
                    setImagePreview(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (newPostImage && newPostCaption.trim()) {
                      // Here you would typically upload to your backend
                      // For now, we'll just close the dialog
                      console.log('Creating post:', { image: newPostImage, caption: newPostCaption, dish: newPostDish });

                      // Reset form
                      setCreatePostOpen(false);
                      setNewPostImage(null);
                      setNewPostCaption('');
                      setNewPostDish('');
                      setImagePreview(null);

                      // You could add the new post to the posts array here
                      // posts.push({ url: imagePreview, caption: newPostCaption });
                    }
                  }}
                  disabled={!newPostImage || !newPostCaption.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
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
