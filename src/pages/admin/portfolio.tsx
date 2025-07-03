import React, { useState } from 'react';
import { useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, GraduationCap, Briefcase, Clock, FileCheck, Utensils, Shield, X } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

export default function Portfolio() {
  const [match, params] = useRoute("/admin/portfolio/:id");
  const user = exampleData.find((u) => String(u.id) === params?.id);

  // Mock posts (replace with real data if available)
  const posts = [
    { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80", caption: "First day at C-CAP!" },
    { url: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=600&q=80", caption: "Baking class fun." },
    { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80", caption: "Teamwork in the kitchen." },
    { url: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&w=600&q=80", caption: "Trying a new recipe." },
    { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80", caption: "Plating practice." },
    { url: "https://images.unsplash.com/photo-1488992783499-418eb1f62d08?auto=format&fit=crop&w=600&q=80", caption: "Pastry perfection." },
    { url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80", caption: "Culinary competition day." },
    { url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80", caption: "Learning from the chef." },
    { url: "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=600&q=80", caption: "Group project success." },
    { url: "https://images.unsplash.com/photo-1559715745-e1b33a271c8f?auto=format&fit=crop&w=600&q=80", caption: "Final presentation!" },
    { url: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=600&q=80", caption: "Knife skills workshop." },
    { url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80", caption: "Pizza making class." },
    { url: "https://images.unsplash.com/photo-1528712306091-ed0763094c98?auto=format&fit=crop&w=600&q=80", caption: "Sauce preparation." },
    { url: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=600&q=80", caption: "Fresh ingredients day." },
    { url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80", caption: "Dessert plating." },
    { url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80", caption: "Bread baking session." },
    { url: "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?auto=format&fit=crop&w=600&q=80", caption: "Kitchen safety training." },
    { url: "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=600&q=80", caption: "Menu planning workshop." },
    { url: "https://images.unsplash.com/photo-1551782450-17144efb9c50?auto=format&fit=crop&w=600&q=80", caption: "Food photography lesson." },
    { url: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=600&q=80", caption: "Graduation celebration!" },
];

  // Modal state for post popup
  const [selectedPost, setSelectedPost] = useState<null | { url: string; caption: string }>(null);

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6">
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
                      <img src={post.url} alt="Post" className="object-cover w-full h-full" />
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

// Example data type based on Google Sheets structure
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
  }
  
  // Example data based on Google Sheets structure
  const exampleData: Submission[] = [
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
  