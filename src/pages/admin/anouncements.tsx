import React, { useState } from 'react';
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  Plus,
  Smile,
  Bell,
  Star,
  Users,
  Shield,
  BookOpen,
  Heart,
  Gift,
  Globe,
  Mail,
  MessageCircle,
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
    icon: "megaphone",
    category: "feature"
  },
  {
    id: 2,
    title: "System Maintenance Scheduled",
    description: "Scheduled maintenance will occur on Sunday, January 15th from 2:00 AM to 6:00 AM EST. Some features may be temporarily unavailable during this time. We apologize for any inconvenience.",
    date: "1 day ago",
    priority: "medium",
    icon: "alert",
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
    icon: "calendar",
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
    icon: "alert",
    category: "urgent"
  },
  {
    id: 7,
    title: "Scholarship Application Deadline",
    description: "The deadline for spring semester scholarship applications is approaching. Don't miss out on this opportunity to reduce your educational costs.",
    date: "2 weeks ago",
    priority: "medium",
    icon: "gift",
    category: "scholarship"
  },
  {
    id: 8,
    title: "Campus Safety Reminder",
    description: "As we approach the winter months, please remember to follow campus safety protocols. Report any suspicious activity immediately.",
    date: "3 weeks ago",
    priority: "low",
    icon: "shield",
    category: "safety"
  },
  {
    id: 9,
    title: "New Email Notification System",
    description: "We've implemented a new email notification system to keep you updated on your application status. You'll now receive timely updates via email.",
    date: "4 days ago",
    priority: "medium",
    icon: "mail",
    category: "feature"
  },
  {
    id: 10,
    title: "Student Portal Feedback Request",
    description: "We value your feedback! Please take a moment to share your thoughts about the student portal experience. Your input helps us improve our services.",
    date: "1 week ago",
    priority: "low",
    icon: "message",
    category: "general"
  },
  {
    id: 11,
    title: "International Student Orientation",
    description: "Welcome to our international students! Join us for a comprehensive orientation session to help you navigate campus life and academic requirements.",
    date: "5 days ago",
    priority: "high",
    icon: "globe",
    category: "team"
  },
  {
    id: 12,
    title: "Academic Excellence Awards",
    description: "Congratulations to all students who have achieved academic excellence! Award ceremonies will be held next month to recognize your outstanding achievements.",
    date: "2 weeks ago",
    priority: "medium",
    icon: "star",
    category: "general"
  }
];

const ICON_OPTIONS = [
  { label: 'Megaphone', value: 'megaphone', icon: <Megaphone className="h-5 w-5" /> },
  { label: 'Bell', value: 'bell', icon: <Bell className="h-5 w-5" /> },
  { label: 'Alert', value: 'alert', icon: <AlertTriangle className="h-5 w-5" /> },
  { label: 'Calendar', value: 'calendar', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Clock', value: 'clock', icon: <Clock className="h-5 w-5" /> },
  { label: 'Info', value: 'info', icon: <Info className="h-5 w-5" /> },
  { label: 'Check', value: 'check', icon: <CheckCircle className="h-5 w-5" /> },
  { label: 'Star', value: 'star', icon: <Star className="h-5 w-5" /> },
  { label: 'Users', value: 'users', icon: <Users className="h-5 w-5" /> },
  { label: 'Shield', value: 'shield', icon: <Shield className="h-5 w-5" /> },
  { label: 'Book', value: 'book', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Heart', value: 'heart', icon: <Heart className="h-5 w-5" /> },
  { label: 'Gift', value: 'gift', icon: <Gift className="h-5 w-5" /> },
  { label: 'Globe', value: 'globe', icon: <Globe className="h-5 w-5" /> },
  { label: 'Mail', value: 'mail', icon: <Mail className="h-5 w-5" /> },
  { label: 'Message', value: 'message', icon: <MessageCircle className="h-5 w-5" /> },
  // Custom emoji
  { label: 'Party', value: '🎉', icon: <span className="text-lg">🎉</span> },
  { label: 'Wrench', value: '🔧', icon: <span className="text-lg">🔧</span> },
  { label: 'Clipboard', value: '📋', icon: <span className="text-lg">📋</span> },
  { label: 'Office', value: '🏢', icon: <span className="text-lg">🏢</span> },
  { label: 'Wave', value: '👋', icon: <span className="text-lg">👋</span> },
  { label: 'Warning', value: '⚠️', icon: <span className="text-lg">⚠️</span> },
  { label: 'Money', value: '💰', icon: <span className="text-lg">💰</span> },
  { label: 'Shield Emoji', value: '🛡️', icon: <span className="text-lg">🛡️</span> },
];

const lucideIconMap: Record<string, React.ReactNode> = {
  megaphone: <Megaphone className="h-5 w-5 text-white" />,
  bell: <Bell className="h-5 w-5 text-white" />,
  alert: <AlertTriangle className="h-5 w-5 text-white" />,
  calendar: <Calendar className="h-5 w-5 text-white" />,
  clock: <Clock className="h-5 w-5 text-white" />,
  info: <Info className="h-5 w-5 text-white" />,
  check: <CheckCircle className="h-5 w-5 text-white" />,
  star: <Star className="h-5 w-5 text-white" />,
  users: <Users className="h-5 w-5 text-white" />,
  shield: <Shield className="h-5 w-5 text-white" />,
  book: <BookOpen className="h-5 w-5 text-white" />,
  heart: <Heart className="h-5 w-5 text-white" />,
  gift: <Gift className="h-5 w-5 text-white" />,
  globe: <Globe className="h-5 w-5 text-white" />,
  mail: <Mail className="h-5 w-5 text-white" />,
  message: <MessageCircle className="h-5 w-5 text-white" />,
};

function renderAnnouncementIcon(icon: string): React.ReactNode {
  if (icon in lucideIconMap) {
    return lucideIconMap[icon];
  }
  return <span className="text-lg">{icon}</span>;
}

export default function Announcements() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    icon: '📢'
  });

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

  const handleCreateAnnouncement = () => {
    const announcementData = {
      id: Date.now(), // Simple ID generation
      ...newAnnouncement,
      date: 'Just now'
    };
    
    console.log('New Announcement Data:', JSON.stringify(announcementData, null, 2));
    
    // Reset form
    setNewAnnouncement({
      title: '',
      description: '',
      priority: 'medium',
      category: 'general',
      icon: '📢'
    });
    
    setIsDialogOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setNewAnnouncement(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = newAnnouncement.title.trim() && newAnnouncement.description.trim();

  return (
    <Layout>
      {/* Header */}
      <section className="px-6 py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Megaphone className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-black">Announcements</h1>
            </div>
            
            {/* Create Announcement Button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Announcement</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter announcement title"
                      value={newAnnouncement.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter announcement description"
                      value={newAnnouncement.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newAnnouncement.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={newAnnouncement.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="feature">Feature</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="policy">Policy</SelectItem>
                          <SelectItem value="hours">Office Hours</SelectItem>
                          <SelectItem value="team">Team</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="scholarship">Scholarship</SelectItem>
                          <SelectItem value="safety">Safety</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="icon">Icon</Label>
                    <div className="flex flex-wrap gap-2">
                      {ICON_OPTIONS.map(opt => (
                        <button
                          type="button"
                          key={opt.value}
                          className={`p-2 rounded border ${newAnnouncement.icon === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'} hover:border-blue-400`}
                          onClick={() => handleInputChange('icon', opt.value)}
                          aria-label={opt.label}
                        >
                          {opt.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateAnnouncement}
                    disabled={!isFormValid}
                  >
                    Create Announcement
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
                        {renderAnnouncementIcon(announcement.icon)}
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
