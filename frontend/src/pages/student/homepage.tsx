import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Building2,
  FileText,
  Search,
  ChevronRight,
  Megaphone,
  Bell,
  AlertTriangle,
  Calendar,
  Clock,
  Info,
  CheckCircle,
  Star,
  Users,
  Shield,
  BookOpen,
  Gift,
  Globe,
  Mail,
  MessageCircle,
  MoreHorizontal,
  X,
  Loader2,
  Utensils,
} from "lucide-react";
import Layout from "@/components/layout/StudentLayout";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { api } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { toast } from "sonner";
import { renderTextWithLinks } from "@/lib/linkUtils";

interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  featured_dish: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_liked?: boolean;
  author?: {
    id: string;
    username: string;
    email: string;
  };
}



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

export default function Homepage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [postsOffset, setPostsOffset] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const POSTS_PER_PAGE = 10;


  // Fetch announcements (backend automatically filters for this student)
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoadingAnnouncements(true);
        const response = await api.get(API_ENDPOINTS.ANNOUNCEMENTS_GET_ALL);
        // Get only the top 6 most recent announcements for homepage
        const recentAnnouncements = response.data.slice(0, 6);
        setAnnouncements(recentAnnouncements);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoadingAnnouncements(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Fetch initial posts
  useEffect(() => {
    fetchPosts(0, false);
  }, []);

  // Fetch posts with pagination
  const fetchPosts = async (offset: number, append: boolean) => {
    try {
      if (!append) {
        setLoadingPosts(true);
      } else {
        setLoadingMorePosts(true);
      }

      const response = await api.get(API_ENDPOINTS.POSTS_GET_ALL, {
        params: { limit: POSTS_PER_PAGE, offset }
      });

      if (append) {
        setPosts(prev => [...prev, ...response.data]);
      } else {
        setPosts(response.data);
      }

      setHasMorePosts(response.data.length === POSTS_PER_PAGE);
      setPostsOffset(offset + POSTS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoadingPosts(false);
      setLoadingMorePosts(false);
    }
  };

  // Load more posts
  const handleLoadMore = () => {
    fetchPosts(postsOffset, true);
  };

  // Open post modal
  const handleOpenPost = async (post: Post) => {
    setSelectedPost(post);
    setIsPostDialogOpen(true);
  };



  // Navigate to portfolio (only if it's the current user)
  const handleNavigateToProfile = (userId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    // Only allow navigation to own portfolio
    if (user && String(user.id) === String(userId)) {
      setLocation('/student/portfolio');
    }
  };

  return (
    <Layout>
      {/* Dashboard Hero */}
      <section className="px-6 py-8">
        <div className="max-w-7xl w-full mx-auto">
          <div className="flex lg:flex-row flex-col md:justify-between justify-start gap-2 lg:items-center items-start">
            <h1 className="text-[28px] font-semibold text-ink tracking-tight">
              C•CAP Student Dashboard
            </h1>
            <p className="text-[15px] text-inkmuted">
              Welcome back{user?.full_name ? `, ${user.full_name}` : ""}
            </p>
          </div>
        </div>
      </section>

      {/* Posts and Announcements */}
      <section className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Posts Column */}
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="h-[18px] w-[18px] text-inkmuted" />
                  <h2 className="text-lg font-semibold text-ink">Community Posts</h2>
                </div>
                {/* <Link
                  href="/student/posts"
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  View all →
                </Link> */}
              </div>

              <div className="space-y-3">
                {loadingPosts ? (
                  <div className="bg-white rounded-[10px] border border-line p-12 text-center">
                    <MessageCircle className="h-8 w-8 text-inkmuted/50 mx-auto mb-3 animate-pulse" />
                    <p className="text-[15px] text-inkmuted">Loading posts...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="bg-white rounded-[10px] border border-line p-12 text-center">
                    <MessageCircle className="h-8 w-8 text-inkmuted/50 mx-auto mb-3" />
                    <p className="text-[15px] text-inkmuted">No posts yet. Create your first post to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => handleOpenPost(post)}
                        className="group bg-white border border-line rounded-[10px] p-4 shadow-card cursor-pointer transition-all duration-200 hover:border-brand"
                      >
                        {/* Post Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-9 h-9 rounded-full bg-secondary border border-line flex items-center justify-center text-ink text-sm font-semibold ${user && post.author?.id && String(user.id) === String(post.author.id) ? 'cursor-pointer hover:border-brand transition-colors' : ''
                              }`}
                            onClick={(e) => post.author?.id && handleNavigateToProfile(post.author.id, e)}
                          >
                            {post.author?.username?.substring(0, 2).toUpperCase() || 'ST'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span
                              className={`font-medium text-[15px] text-ink block truncate ${user && post.author?.id && String(user.id) === String(post.author.id) ? 'cursor-pointer hover:underline' : ''
                                }`}
                              onClick={(e) => post.author?.id && handleNavigateToProfile(post.author.id, e)}
                            >
                              {post.author?.username || 'Student'}
                            </span>
                            <span className="text-[13px] text-inkmuted">{formatDate(post.created_at)}</span>
                          </div>
                        </div>

                        {/* Post Image */}
                        <div className="rounded-lg overflow-hidden mb-3 aspect-video bg-secondary">
                          <img
                            src={post.image_url}
                            alt="Post"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                          />
                        </div>

                        {/* Post Caption */}
                        {post.caption && (
                          <p className="text-ink text-[15px] mb-2 line-clamp-2">{post.caption}</p>
                        )}

                        {/* Featured Dish */}
                        {post.featured_dish && (
                          <span className="inline-flex items-center rounded-md bg-warning-soft text-warning text-[13px] font-medium px-2 py-0.5">
                            Featured: {post.featured_dish}
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Load More Button or Spinner */}
                    {hasMorePosts && (
                      <div className="text-center py-4">
                        {loadingMorePosts ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-inkmuted" />
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={handleLoadMore}
                            className="w-full"
                          >
                            Load More Posts
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Announcements Column */}
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Megaphone className="h-[18px] w-[18px] text-inkmuted" />
                  <h2 className="text-lg font-semibold text-ink">Announcements</h2>
                </div>
                <Link
                  href="/student/announcements"
                  className="text-sm font-medium text-brand hover:underline"
                >
                  View all →
                </Link>
              </div>

              <div className="space-y-3">
                {loadingAnnouncements ? (
                  <div className="bg-white rounded-[10px] border border-line p-12 text-center">
                    <Megaphone className="h-8 w-8 text-inkmuted/50 mx-auto mb-3 animate-pulse" />
                    <p className="text-[15px] text-inkmuted">Loading announcements...</p>
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="bg-white rounded-[10px] border border-line p-12 text-center">
                    <Megaphone className="h-8 w-8 text-inkmuted/50 mx-auto mb-3" />
                    <p className="text-[15px] text-inkmuted">There are no announcements for you at this time.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="bg-white border border-line rounded-[10px] p-4 shadow-card">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-brand-soft rounded-[10px] flex items-center justify-center flex-shrink-0 [&_svg]:text-brand">
                            {renderAnnouncementIcon(announcement.icon)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-ink text-[15px] mb-1">
                              {announcement.title}
                            </h4>
                            <p className="text-[15px] text-inkmuted mb-2 leading-relaxed line-clamp-2">
                              {renderTextWithLinks(announcement.content)}
                            </p>
                            <p className="text-[13px] text-inkmuted/80 mb-2">
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
                                          ? announcement.target_locations?.join(', ') || 'Multiple States'
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
            </div>
          </div>
        </div>
      </section>

      {/* Post Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent
          className="p-0 max-h-[95vh]"
          style={{ width: '95vw', maxWidth: 'none' }}
        >
          {selectedPost && (
            <div className="flex flex-col md:flex-row h-full">
              {/* Left Side - Image */}
              <div className="md:w-3/5 bg-ink flex items-center justify-center">
                <img
                  src={selectedPost.image_url}
                  alt="Post"
                  className="w-full h-auto max-h-[95vh] object-contain"
                />
              </div>

              {/* Right Side - Post Info */}
              <div className="md:w-2/5 flex flex-col bg-white">
                {/* Post Header */}
                <div className="p-4 border-b border-line flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary border border-line flex items-center justify-center text-ink font-semibold">
                    {selectedPost.author?.username?.substring(0, 2).toUpperCase() || 'ST'}
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900 block">{selectedPost.author?.username || 'Student'}</span>
                    <span className="text-xs text-gray-500">{formatDate(selectedPost.created_at)}</span>
                  </div>
                </div>

                {/* Featured Dish */}
                {selectedPost.featured_dish && (
                  <div className="p-4 border-b border-line">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-warning" />
                      <span className="font-semibold text-ink">Featured Dish:</span>
                    </div>
                    <Badge variant="outline" className="mt-2 rounded-md border-transparent text-sm bg-warning-soft text-warning">
                      {selectedPost.featured_dish}
                    </Badge>
                  </div>
                )}

                {/* Chapter Reflection */}
                <div className="p-4 flex-1">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary border border-line flex items-center justify-center text-ink font-semibold flex-shrink-0">
                      {selectedPost.author?.username?.substring(0, 2).toUpperCase() || 'ST'}
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">{selectedPost.author?.username || 'Student'} </span>
                      <span className="text-gray-900">{selectedPost.caption}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
