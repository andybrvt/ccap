import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Layout from "@/components/layout/AdminLayout";
import { api } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { PROGRAM_STAGE_OPTIONS, CCAP_CONNECTION_OPTIONS } from '@/lib/constants';
import { renderTextWithLinks } from "@/lib/linkUtils";
import {
  Megaphone,
  Search,
  Calendar,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  Plus,
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
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";

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
  created_by?: string | null;
}

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

const BUCKETS = PROGRAM_STAGE_OPTIONS;

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
  // State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'medium',
    category: 'general',
    icon: 'megaphone',
    target_audience: 'all',
    target_bucket: '',
    target_city: '',
    target_state: '',
    target_program_stages: [] as string[],
    target_locations: [] as string[],
    send_email: true,
    send_to_admins: false,
  });

  // Fetch announcements
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

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Filter announcements
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
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

  // Reset form
  const resetForm = () => {
    setAnnouncementForm({
      title: '',
      content: '',
      priority: 'medium',
      category: 'general',
      icon: 'megaphone',
      target_audience: 'all',
      target_bucket: '',
      target_city: '',
      target_state: '',
      target_program_stages: [],
      target_locations: [],
      send_email: true,
      send_to_admins: false,
    });
  };

  // Create announcement
  const handleCreateAnnouncement = async () => {
    try {
      setSubmitting(true);

      // Prepare payload
      const payload: any = {
        title: announcementForm.title,
        content: announcementForm.content,
        priority: announcementForm.priority,
        category: announcementForm.category,
        icon: announcementForm.icon,
        target_audience: announcementForm.target_audience,
        target_program_stages: announcementForm.target_program_stages,
        target_locations: announcementForm.target_locations,
        send_email: announcementForm.send_email,
        send_to_admins: announcementForm.send_to_admins,
      };

      await api.post(API_ENDPOINTS.ANNOUNCEMENTS_CREATE, payload);
      toast.success('Announcement created successfully!');

      // Refresh list and reset
      fetchAnnouncements();
      resetForm();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      toast.error(error.response?.data?.detail || 'Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit announcement
  const handleEditClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      category: announcement.category,
      icon: announcement.icon,
      target_audience: announcement.target_audience,
      target_bucket: announcement.target_bucket || '',
      target_city: announcement.target_city || '',
      target_state: announcement.target_state || '',
      target_program_stages: announcement.target_program_stages || [],
      target_locations: announcement.target_locations || [],
      send_email: true,
      send_to_admins: false,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateAnnouncement = async () => {
    if (!selectedAnnouncement) return;

    try {
      setSubmitting(true);

      // Prepare payload
      const payload: any = {
        title: announcementForm.title,
        content: announcementForm.content,
        priority: announcementForm.priority,
        category: announcementForm.category,
        icon: announcementForm.icon,
        target_audience: announcementForm.target_audience,
        target_program_stages: announcementForm.target_program_stages,
        target_locations: announcementForm.target_locations,
      };

      await api.put(`${API_ENDPOINTS.ANNOUNCEMENTS_UPDATE}${selectedAnnouncement.id}`, payload);
      toast.success('Announcement updated successfully!');

      // Refresh list and reset
      fetchAnnouncements();
      resetForm();
      setIsEditDialogOpen(false);
      setSelectedAnnouncement(null);
    } catch (error: any) {
      console.error('Error updating announcement:', error);
      toast.error(error.response?.data?.detail || 'Failed to update announcement');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete announcement
  const handleDeleteClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteAnnouncement = async () => {
    if (!selectedAnnouncement) return;

    try {
      await api.delete(`${API_ENDPOINTS.ANNOUNCEMENTS_DELETE}${selectedAnnouncement.id}`);
      toast.success('Announcement deleted successfully!');

      // Refresh list and reset
      fetchAnnouncements();
      setIsDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
    } catch (error: any) {
      console.error('Error deleting announcement:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete announcement');
    }
  };

  const handleInputChange = (field: string, value: string | string[] | boolean) => {
    setAnnouncementForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = announcementForm.title.trim() && announcementForm.content.trim() &&
    (announcementForm.target_audience === 'all' ||
      (announcementForm.target_audience === 'program_stages' && announcementForm.target_program_stages.length > 0) ||
      (announcementForm.target_audience === 'locations' && announcementForm.target_locations.length > 0) ||
      (announcementForm.target_audience === 'both' && (announcementForm.target_program_stages.length > 0 || announcementForm.target_locations.length > 0)));

  // Render announcement form fields
  const renderAnnouncementForm = () => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="Enter announcement title"
          value={announcementForm.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          placeholder="Enter announcement content"
          value={announcementForm.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={announcementForm.priority} onValueChange={(value) => handleInputChange('priority', value)}>
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
          <Select value={announcementForm.category} onValueChange={(value) => handleInputChange('category', value)}>
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
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
          {ICON_OPTIONS.map(opt => (
            <button
              type="button"
              key={opt.value}
              className={`p-2 rounded border ${announcementForm.icon === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'} hover:border-blue-400`}
              onClick={() => handleInputChange('icon', opt.value)}
              aria-label={opt.label}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Target Audience Section */}
      <div className="grid gap-2 pt-4 border-t">
        <Label htmlFor="target_audience">Target Audience *</Label>
        <Select value={announcementForm.target_audience} onValueChange={(value) => handleInputChange('target_audience', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students (Global)</SelectItem>
            <SelectItem value="program_stages">Multiple Program Stages</SelectItem>
            <SelectItem value="locations">Multiple Locations</SelectItem>
            <SelectItem value="both">Both Program Stages & Locations</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conditional fields based on target audience */}
      {announcementForm.target_audience === 'program_stages' && (
        <div className="grid gap-2">
          <Label htmlFor="target_program_stages">Program Stages *</Label>
          <MultiSelect
            options={BUCKETS.map(bucket => ({ value: bucket, label: bucket }))}
            onValueChange={(values) => handleInputChange('target_program_stages', values)}
            defaultValue={announcementForm.target_program_stages}
            placeholder="Select program stages"
            maxCount={3}
          />
        </div>
      )}

      {announcementForm.target_audience === 'locations' && (
        <div className="grid gap-2">
          <Label htmlFor="target_locations">C•CAP Locations *</Label>
          <MultiSelect
            options={CCAP_CONNECTION_OPTIONS.map(location => ({ value: location, label: location }))}
            onValueChange={(values) => handleInputChange('target_locations', values)}
            defaultValue={announcementForm.target_locations}
            placeholder="Select locations"
            maxCount={5}
          />
        </div>
      )}

      {announcementForm.target_audience === 'both' && (
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="target_program_stages">Program Stages</Label>
            <MultiSelect
              options={BUCKETS.map(bucket => ({ value: bucket, label: bucket }))}
              onValueChange={(values) => handleInputChange('target_program_stages', values)}
              defaultValue={announcementForm.target_program_stages}
              placeholder="Select program stages (optional)"
              maxCount={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="target_locations">C•CAP Locations</Label>
            <MultiSelect
              options={CCAP_CONNECTION_OPTIONS.map(location => ({ value: location, label: location }))}
              onValueChange={(values) => handleInputChange('target_locations', values)}
              defaultValue={announcementForm.target_locations}
              placeholder="Select locations (optional)"
              maxCount={5}
            />
          </div>
          <p className="text-sm text-gray-600">
            Students will see this announcement if they match ANY of the selected program stages OR ANY of the selected locations.
          </p>
        </div>
      )}

      {/* Email Notification Checkboxes */}
      <div className="grid gap-3 pt-4 border-t">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="send_email"
            checked={announcementForm.send_email}
            onCheckedChange={(checked) => handleInputChange('send_email', checked as boolean)}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="send_email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Send email notification to students
            </label>
            <p className="text-sm text-muted-foreground">
              When enabled, all students matching the target audience will receive an email notification about this announcement.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="send_to_admins"
            checked={announcementForm.send_to_admins}
            onCheckedChange={(checked) => handleInputChange('send_to_admins', checked as boolean)}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="send_to_admins"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Send to admins
            </label>
            <p className="text-sm text-muted-foreground">
              When enabled, all admins will receive the announcement email (useful for testing before sending to students).
            </p>
          </div>
        </div>
      </div>
    </div>
  );

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

              {/* Create Announcement Button */}
              <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Announcement</DialogTitle>
                  </DialogHeader>
                  {renderAnnouncementForm()}
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateAnnouncement}
                      disabled={!isFormValid || submitting}
                    >
                      {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
                    : "There are no announcements at this time. Create one to get started!"
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
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                          {renderAnnouncementIcon(announcement.icon)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-black mb-2">
                            {announcement.title}
                          </h3>
                          <p className="text-gray-600 mb-3 leading-relaxed">
                            {renderTextWithLinks(announcement.content)}
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
                                {announcement.target_audience === 'program_stages'
                                  ? `📦 ${announcement.target_program_stages?.join(', ') || 'Multiple Stages'}`
                                  : announcement.target_audience === 'locations'
                                    ? `📍 ${announcement.target_locations?.join(', ') || 'Multiple States'}`
                                    : announcement.target_audience === 'both'
                                      ? `📦📍 ${(announcement.target_program_stages?.length || 0) + (announcement.target_locations?.length || 0)} selections`
                                      : `🎯 ${announcement.target_audience}`
                                }
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 3-dot menu for edit/delete */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(announcement)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(announcement)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          resetForm();
          setSelectedAnnouncement(null);
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          {renderAnnouncementForm()}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAnnouncement}
              disabled={!isFormValid || submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Announcement
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the announcement "{selectedAnnouncement?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAnnouncement}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
