import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  FileText,
  Search,
  ChevronRight,
  Megaphone,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";   

// Dummy announcements data
const announcements = [
  {
    id: 1,
    title: "New CCAP Application Portal Launch",
    description: "We're excited to announce the launch of our new CCAP application portal with enhanced features and improved user experience.",
    date: "2 hours ago",
    priority: "high",
    icon: "🎉"
  },
  {
    id: 2,
    title: "System Maintenance Scheduled",
    description: "Scheduled maintenance will occur on Sunday, January 15th from 2:00 AM to 6:00 AM EST. Some features may be temporarily unavailable.",
    date: "1 day ago",
    priority: "medium",
    icon: "🔧"
  },
  {
    id: 3,
    title: "Updated Application Guidelines",
    description: "Please review the updated application guidelines for the 2024-2025 academic year. New requirements have been added.",
    date: "3 days ago",
    priority: "low",
    icon: "📋"
  },
  {
    id: 4,
    title: "Holiday Office Hours",
    description: "Our office will be closed for the upcoming holidays. Applications submitted during this period will be processed when we return. Please plan accordingly.",
    date: "1 week ago",
    priority: "medium",
    icon: "🏢",
    category: "hours"
  },
  {
    id: 5,
    title: "New Staff Member Welcome",
    description: "Please join us in welcoming our new team member who will be handling application processing. They bring extensive experience in student services.",
    date: "1 week ago",
    priority: "low",
    icon: "👋",
    category: "team"
  },
];

export default function Homepage() {
  const { user, logout } = useAuth();

  return (
    <Layout>
      {/* Dashboard Hero */}
      <section className="px-6 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-black mb-3">
              Welcome back, {user?.full_name}
            </h1>
            <p className="text-lg text-gray-600">
              CCAP Application Management System
            </p>
          </div>

          {/* Two Column Layout - Start Application + Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Submissions Card */}
            <div className="lg:col-span-1">
              <Link href="/admin/submissions">
                <div className="group min-h-36 relative bg-gradient-to-r from-black to-gray-800 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden h-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 h-full flex items-center">
                    <div className="flex items-center w-full">
                      <div className="flex-1 items-start gap-4 flex flex-col"> 
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                        <FileText className="h-5 w-5 text-gray-600 " />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-1">
                          Submissions
                        </h2>
                        <p className="text-gray-300">
                          View and manage all your applications
                        </p>
                      </div>
                      </div>
                    
                      <ChevronRight className="h-6 w-6 text-white group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Portfolio Lookup Card */}
            <div className="lg:col-span-1">
              <Link href="/admin/portfolio-lookup">
                <div className="group min-h-36 relative bg-gradient-to-r from-gray-800 to-black rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden h-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 h-full flex items-center">
                    <div className="flex items-center w-full">
                      <div className="flex-1 items-start gap-4 flex flex-col"> 
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                          <Search className="h-6 w-6 text-black" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-white mb-1">
                            Portfolio Lookup
                          </h2>
                          <p className="text-gray-300">
                            View students portfolio
                          </p>
                        </div>
                      </div>
                      
                      <ChevronRight className="h-6 w-6 text-white group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

  

      {/* Announcements */}
      <section className="px-6 py-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Megaphone className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-black">Announcements</h2>
            </div>
            <Link
              href="/admin/announcements"
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 mx-auto bg-white">
            {announcements.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Megaphone className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Announcements</h3>
                <p className="text-gray-600">There are no announcements at this time. Check back later for updates.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-white text-sm">{announcement.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-black mb-1">
                          {announcement.title}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          {announcement.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {announcement.date}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={announcement.priority === 'high' ? 'destructive' : announcement.priority === 'medium' ? 'secondary' : 'outline'} 
                      className="text-xs ml-4"
                    >
                      {announcement.priority === 'high' ? 'Important' : announcement.priority === 'medium' ? 'Notice' : 'Info'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Actions Bar */}
      <section className="px-6 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-black mb-1">
                  Need help getting started?
                </h3>
                <p className="text-gray-600 text-sm">
                  Our team is here to guide you through every step
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Schedule Demo
                </Button>
                <Button className="bg-black text-white hover:bg-gray-800">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-black">
                Sinatra Insurance Group
              </span>
            </div>
            <div className="text-sm text-gray-600">
              © 2025 Sinatra Insurance Group. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
}
