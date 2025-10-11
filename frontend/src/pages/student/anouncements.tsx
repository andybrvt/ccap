import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Megaphone,
  Search,
  Calendar,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
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
  Loader2,
} from "lucide-react";
import Layout from "@/components/layout/StudentLayout";
import { api } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { toast } from "sonner";

// Types
interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  category: string;
  icon: string;
  target_audience: string;
  target_bucket?: string | null;
  target_city?: string | null;
  target_state?: string | null;
  created_at: string;
  updated_at?: string | null;
}

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

function formatDate(dateString: string): string {
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
}

export default function Announcements() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch announcements (backend automatically filters for students)
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await api.get(API_ENDPOINTS.ANNOUNCEMENTS_GET_ALL);
        setAnnouncements(response.data);
      } catch (error: any) {
        console.error('Error fetching announcements:', error);
        toast.error(error.response?.data?.detail || 'Failed to fetch announcements');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Filter announcements based on search term and priority
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || announcement.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <Layout>
      <div className="flex flex-col max-h-[calc(100vh-6rem)]">
        {/* Header */}
        <section className="px-6 py-8 bg-white border-b border-gray-200 shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
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
        <section className="flex-1 min-h-0 overflow-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Megaphone className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Announcements Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedPriority !== 'all'
                    ? "Try adjusting your search or filter criteria."
                    : "There are no announcements for you at this time. Check back later for updates."
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
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                        {renderAnnouncementIcon(announcement.icon)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-black mb-2">
                          {announcement.title}
                        </h3>
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {announcement.content}
                        </p>
                        <p className="text-sm text-gray-500 mb-3">
                          {formatDate(announcement.created_at)}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant={announcement.priority === 'high' ? 'destructive' : announcement.priority === 'medium' ? 'secondary' : 'outline'}
                            className="text-xs capitalize"
                          >
                            {announcement.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize bg-gray-50">
                            {announcement.category}
                          </Badge>
                          {announcement.target_audience !== 'all' && (
                            <Badge variant="outline" className="text-xs">
                              {announcement.target_audience === 'bucket'
                                ? `📦 ${announcement.target_bucket}`
                                : `📍 ${announcement.target_state}`
                              }
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
