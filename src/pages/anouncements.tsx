import React, { useState } from 'react';
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Navigation } from "@/components/layout/Navigation";
import {
  Megaphone,
  Search,
  ArrowLeft,
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
} from "lucide-react";
import Layout from "@/components/layout/Layout";

// Extended dummy announcements data
const allAnnouncements = [
  {
    id: 1,
    title: "New CCAP Application Portal Launch",
    description: "We're excited to announce the launch of our new CCAP application portal with enhanced features and improved user experience. This new portal includes better navigation, faster processing times, and improved mobile responsiveness.",
    date: "2 hours ago",
    priority: "high",
    icon: "🎉",
    category: "feature"
  },
  {
    id: 2,
    title: "System Maintenance Scheduled",
    description: "Scheduled maintenance will occur on Sunday, January 15th from 2:00 AM to 6:00 AM EST. Some features may be temporarily unavailable during this time. We apologize for any inconvenience.",
    date: "1 day ago",
    priority: "medium",
    icon: "🔧",
    category: "maintenance"
  },
  {
    id: 3,
    title: "Updated Application Guidelines",
    description: "Please review the updated application guidelines for the 2024-2025 academic year. New requirements have been added and some existing ones have been modified to better serve our students.",
    date: "3 days ago",
    priority: "low",
    icon: "📋",
    category: "policy"
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
  {
    id: 6,
    title: "Emergency Contact Update Required",
    description: "All students must update their emergency contact information by the end of this month. This is a mandatory requirement for continued enrollment.",
    date: "2 weeks ago",
    priority: "high",
    icon: "⚠️",
    category: "urgent"
  },
  {
    id: 7,
    title: "Scholarship Application Deadline",
    description: "The deadline for spring semester scholarship applications is approaching. Don't miss out on this opportunity to reduce your educational costs.",
    date: "2 weeks ago",
    priority: "medium",
    icon: "💰",
    category: "scholarship"
  },
  {
    id: 8,
    title: "Campus Safety Reminder",
    description: "As we approach the winter months, please remember to follow campus safety protocols. Report any suspicious activity immediately.",
    date: "3 weeks ago",
    priority: "low",
    icon: "🛡️",
    category: "safety"
  }
];

export default function Announcements() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Filter announcements based on search term and priority
  const filteredAnnouncements = allAnnouncements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || announcement.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Layout>
      {/* Header */}
      <section className="px-6 py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Megaphone className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-black">Announcements</h1>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedPriority === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPriority('all')}
              >
                All
              </Button>
              <Button
                variant={selectedPriority === 'high' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPriority('high')}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                High Priority
              </Button>
              <Button
                variant={selectedPriority === 'medium' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPriority('medium')}
                className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
              >
                Medium Priority
              </Button>
              <Button
                variant={selectedPriority === 'low' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPriority('low')}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Low Priority
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements List */}
      <section className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Megaphone className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Announcements Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedPriority !== 'all' 
                  ? "Try adjusting your search or filter criteria."
                  : "There are no announcements at this time. Check back later for updates."
                }
              </p>
              {(searchTerm || selectedPriority !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedPriority('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map((announcement) => (
                <div key={announcement.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">{announcement.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-black">
                            {announcement.title}
                          </h3>
                          {getPriorityIcon(announcement.priority)}
                        </div>
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {announcement.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {announcement.date}
                          </div>
                          <Badge 
                            variant={announcement.priority === 'high' ? 'destructive' : announcement.priority === 'medium' ? 'secondary' : 'outline'} 
                            className="text-xs"
                          >
                            {announcement.priority === 'high' ? 'Important' : announcement.priority === 'medium' ? 'Notice' : 'Info'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
