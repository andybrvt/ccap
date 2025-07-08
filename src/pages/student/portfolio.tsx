import React, { useState } from 'react';
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, GraduationCap, Briefcase, Clock, FileCheck, Utensils, Shield, X, Pencil, Plus, Upload } from "lucide-react";
import Layout from "@/components/layout/StudentLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Portfolio() {
  const { user, logout } = useAuth();
  const student = exampleData.find((u) => u.id === user?.id);
  const [, setLocation] = useLocation();

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (!student) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="">
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
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-500 mb-4 border-4 border-blue-200">
                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                </div>
                <h1 className="text-2xl font-bold text-blue-700 mb-1 text-center md:text-left">
                  {student.firstName} {student.lastName}
                  {student.preferredName && (
                    <span className="text-lg text-blue-400 ml-2">({student.preferredName})</span>
                  )}
                </h1>
                <div className="flex flex-wrap gap-2 mb-2 justify-center md:justify-start">
                  {student.interestedOptions.map((option, i) => (
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
                  <span className="flex items-center gap-1"><Mail className="w-4 h-4 text-blue-400" />{student.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-blue-400" />{student.mobileNumber}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-blue-400" />{student.city}, {student.state}</span>
                </div>
                <hr className="my-2 border-blue-100" />
                {/* Education */}
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-blue-700 flex items-center gap-2 text-lg"><GraduationCap className="w-5 h-5 text-blue-500" />Education</span>
                  <span className="ml-7 text-blue-900 text-sm">
                    <span className="font-semibold text-blue-600">{student.highSchool}</span> <span className="text-gray-500">({student.graduationYear})</span>
                  </span>
                </div>
                {/* Work */}
                <div className="flex flex-col gap-1 mt-2">
                  <span className="font-semibold text-green-700 flex items-center gap-2 text-lg"><Briefcase className="w-5 h-5 text-green-500" />Work</span>
                  <span className="ml-7 text-green-700 text-sm">
                    <span className="font-semibold">{student.currentJob === "Yes" ? "Currently at" : "Not currently working"}</span>
                    <span className="text-gray-900">{student.currentJob === "Yes" ? ` ${student.currentEmployer}` : ""}</span>
                  </span>
                  {student.pastJob === "Yes" && (
                    <span className="ml-7 text-green-500 text-xs">Past: <span className="text-gray-700">{student.pastPosition} at {student.pastEmployer} ({student.pastHours} hrs/week)</span></span>
                  )}
                  <span className="ml-7 text-green-600 text-xs">Culinary Exp: <span className="text-gray-900">{student.culinaryYears} years</span></span>
                </div>
                {/* Credentials */}
                <div className="flex flex-col gap-1 mt-2">
                  <span className="font-semibold text-purple-700 flex items-center gap-2 text-lg"><FileCheck className="w-5 h-5 text-purple-500" />Credentials</span>
                  <div className="ml-7 flex flex-col gap-2 text-purple-900 text-sm">
                    <span className="flex items-center gap-1"><FileCheck className="w-4 h-4 text-purple-400" /><span className="font-semibold text-purple-700">Resume:</span> <span className="text-gray-900">{
                      student.hasResume === "Yes"
                        ? (student.resumeUrl && student.resumeUrl.trim() !== ""
                          ? <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 font-medium hover:text-blue-800 transition-colors">View Resume</a>
                          : "Not Available")
                        : "Not Provided"
                    }</span></span>
                    <span className="flex items-center gap-1"><Utensils className="w-4 h-4 text-purple-400" /><span className="font-semibold text-purple-700">Food Handler:</span> <span className="text-gray-900">{student.foodHandlersCard}</span></span>
                    <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-purple-400" /><span className="font-semibold text-purple-700">ServSafe:</span> <span className="text-gray-900">{student.servsafeCredentials || "No"}</span></span>
                  </div>
                </div>
                {/* Details */}
                <div className="flex flex-col gap-1 mt-4">
                  <span className="font-semibold text-blue-700 flex items-center gap-2 text-lg">Details</span>
                  <div className="ml-7 flex flex-col gap-y-1 text-xs text-gray-500 bg-blue-50 rounded-lg p-4 border border-blue-100 mt-1">
                    <span><span className="font-semibold text-blue-700">Date of Birth:</span> <span className="text-gray-900">{student.dateOfBirth}</span></span>
                    <span><span className="font-semibold text-blue-700">Transportation:</span> <span className="text-gray-900">{student.transportation}</span></span>
                    <span><span className="font-semibold text-blue-700">Available Times:</span> <span className="text-gray-900">{student.availableTimes}</span></span>
                    <span><span className="font-semibold text-blue-700">Available Weekends:</span> <span className="text-gray-900">{student.availableWeekends}</span></span>
                    <span><span className="font-semibold text-blue-700">Ready to Work:</span> <span className="text-gray-900">{student.readyToWork} {student.readyDate && `(from ${student.readyDate})`}</span></span>
                    <span><span className="font-semibold text-blue-700">Will Relocate:</span> <span className="text-gray-900">{student.willRelocate} {student.relocationStates.length > 0 && `(${student.relocationStates.join(", ")})`}</span></span>
                    <span><span className="font-semibold text-blue-700">Address:</span> <span className="text-gray-900">{student.address} {student.address2}</span></span>
                    <span><span className="font-semibold text-blue-700">Zip:</span> <span className="text-gray-900">{student.zipCode}</span></span>
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

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreatePostOpen(false);
                    setNewPostImage(null);
                    setNewPostCaption('');
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
                      console.log('Creating post:', { image: newPostImage, caption: newPostCaption });

                      // Reset form
                      setCreatePostOpen(false);
                      setNewPostImage(null);
                      setNewPostCaption('');
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
    culinaryYears: "2"
  }
];
