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
import { renderTextWithLinks } from "@/lib/linkUtils";

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
  target_program_stages?: string[] | null;
  target_locations?: string[] | null;
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
      <div className="flex flex-col">
        {/* Header */}
        <section className="px-6 pt-8 pb-2">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-[28px] font-semibold text-ink tracking-tight">Announcements</h1>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-inkmuted h-4 w-4" />
                <Input
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {([
                  { value: 'all', label: 'All', active: 'bg-ink text-white' },
                  { value: 'high', label: 'High', active: 'bg-danger text-white' },
                  { value: 'medium', label: 'Medium', active: 'bg-warning text-white' },
                  { value: 'low', label: 'Low', active: 'bg-inkmuted text-white' },
                ] as const).map((chip) => (
                  <button
                    key={chip.value}
                    onClick={() => setSelectedPriority(chip.value)}
                    className={`h-9 px-4 rounded-full text-sm font-medium transition-colors border ${selectedPriority === chip.value
                      ? `${chip.active} border-transparent`
                      : 'bg-white text-inkmuted border-line hover:bg-secondary hover:text-ink'
                      }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Announcements List */}
        <section className="px-6 py-6 pb-12">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-inkmuted" />
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="h-8 w-8 text-inkmuted/50 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-ink mb-2">No Announcements Found</h3>
                <p className="text-[15px] text-inkmuted mb-4">
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
                  <div key={announcement.id} className="bg-white border border-line rounded-[10px] p-5 shadow-card">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 bg-brand-soft rounded-[10px] flex items-center justify-center flex-shrink-0 [&_svg]:text-brand">
                        {renderAnnouncementIcon(announcement.icon)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-ink mb-1.5">
                          {announcement.title}
                        </h3>
                        <p className="text-[15px] text-inkmuted mb-3 leading-relaxed">
                          {renderTextWithLinks(announcement.content)}
                        </p>
                        <p className="text-[13px] text-inkmuted/80 mb-3">
                          {formatDate(announcement.created_at)}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center rounded-md text-[13px] font-medium px-2 py-0.5 capitalize ${announcement.priority === 'high'
                            ? 'bg-danger-soft text-danger'
                            : announcement.priority === 'medium'
                              ? 'bg-warning-soft text-warning'
                              : 'bg-secondary text-inkmuted'
                            }`}>
                            {announcement.priority}
                          </span>
                          <span className="inline-flex items-center rounded-md bg-secondary text-inkmuted text-[13px] font-medium px-2 py-0.5 capitalize">
                            {announcement.category}
                          </span>
                          {announcement.target_audience !== 'all' && (
                            <span className="inline-flex items-center rounded-md bg-info-soft text-info text-[13px] font-medium px-2 py-0.5">
                              {announcement.target_audience === 'bucket'
                                ? announcement.target_bucket
                                : announcement.target_audience === 'location'
                                  ? announcement.target_state
                                  : announcement.target_audience === 'program_stages'
                                    ? announcement.target_program_stages?.join(', ') || 'Multiple Stages'
                                    : announcement.target_audience === 'locations'
                                      ? announcement.target_locations?.join(', ') || 'Multiple Locations'
                                      : announcement.target_audience === 'both'
                                        ? `${(announcement.target_program_stages?.length || 0) + (announcement.target_locations?.length || 0)} selections`
                                        : announcement.target_audience
                              }
                            </span>
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
