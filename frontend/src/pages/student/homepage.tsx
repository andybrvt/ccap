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
      <section className="px-6 py-8 bg-gray-50">
        <div className="max-w-7xl w-full mx-auto">
          <div className="flex lg:flex-row flex-col md:justify-between justify-start gap-4 items-center">
            <p className="text-3xl font-bold text-black">
              C-CAP Student Dashboard
            </p>
            <p className="text-xl font-medium text-gray-800">
              Welcome back, {user?.full_name}
            </p>
          </div>
        </div>
      </section>

      {/* Posts and Announcements */}
      <section className="px-6 py-0 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Posts Column */}
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-black">Community Posts</h2>
                </div>
                {/* <Link
                  href="/student/posts"
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  View all →
                </Link> */}
              </div>

              <div className="border border-gray-200 rounded-xl bg-white flex-1 flex flex-col h-full p-6">
                {loadingPosts ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <MessageCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">Loading posts...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts</h3>
                    <p className="text-gray-600">No posts yet. Create your first post to get started!</p>
                  </div>
                ) : (
                  <div className="max-h-[550px] overflow-y-auto scrollbar-hide space-y-3">
                    {posts.map((post) => (
                      <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        {/* Post Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold ${user && post.author?.id && String(user.id) === String(post.author.id) ? 'cursor-pointer hover:bg-blue-200 transition-colors' : ''
                                }`}
                              onClick={(e) => post.author?.id && handleNavigateToProfile(post.author.id, e)}
                            >
                              {post.author?.username?.substring(0, 2).toUpperCase() || 'ST'}
                            </div>
                            <div className="flex-1">
                              <span
                                className={`font-semibold text-gray-900 block ${user && post.author?.id && String(user.id) === String(post.author.id) ? 'cursor-pointer hover:underline' : ''
                                  }`}
                                onClick={(e) => post.author?.id && handleNavigateToProfile(post.author.id, e)}
                              >
                                {post.author?.username || 'Student'}
                              </span>
                              <span className="text-xs text-gray-500">{formatDate(post.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Post Image */}
                        <div
                          className="rounded-lg overflow-hidden mb-3 cursor-pointer"
                          onClick={() => handleOpenPost(post)}
                        >
                          <img
                            src={post.image_url}
                            alt="Post"
                            className="w-full h-48 object-cover hover:scale-105 transition-transform"
                          />
                        </div>

                        {/* Post Actions */}
                        <div className="flex items-center gap-4 mb-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPost(post);
                            }}
                            className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                          >
                            <span className="text-sm font-semibold">View Post</span>
                          </button>
                        </div>

                        {/* Post Caption */}
                        {post.caption && (
                          <p className="text-gray-900 text-sm mb-2">{post.caption}</p>
                        )}

                        {/* Featured Dish */}
                        {post.featured_dish && (
                          <Badge variant="outline" className="border-orange-50 border text-xs bg-orange-200 text-orange-700">
                            Featured: {post.featured_dish}
                          </Badge>
                        )}
                      </div>
                    ))}

                    {/* Load More Button or Spinner */}
                    {hasMorePosts && (
                      <div className="text-center py-4">
                        {loadingMorePosts ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <Megaphone className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-black">Announcements</h2>
                </div>
                <Link
                  href="/student/announcements"
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  View all →
                </Link>
              </div>

              <div className="border border-gray-200 rounded-xl p-6 bg-white flex-1 flex flex-col h-full">
                {loadingAnnouncements ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Megaphone className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">Loading announcements...</p>
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Megaphone className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Announcements</h3>
                    <p className="text-gray-600">There are no announcements for you at this time. Check back later for updates.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                            {renderAnnouncementIcon(announcement.icon)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-black text-sm mb-1">
                              {announcement.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                              {renderTextWithLinks(announcement.content)}
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                              {formatDate(announcement.created_at)}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant={announcement.priority === 'high' ? 'destructive' : announcement.priority === 'medium' ? 'secondary' : 'outline'}
                                className="text-xs capitalize"
                              >
                                {announcement.priority}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs capitalize bg-gray-50"
                              >
                                {announcement.category}
                              </Badge>
                              {announcement.target_audience !== 'all' && (
                                <Badge variant="outline" className="text-xs">
                                  {announcement.target_audience === 'bucket'
                                    ? `📦 ${announcement.target_bucket}`
                                    : announcement.target_audience === 'location'
                                      ? `📍 ${announcement.target_state}`
                                      : announcement.target_audience === 'program_stages'
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
                      </div>
                    ))}
                  </div>
                )}
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
                C-CAP
              </span>
            </div>
            <div className="text-sm text-gray-600">
              © 2025 C-CAP. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Post Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent
          className="p-0 max-h-[95vh]"
          style={{ width: '95vw', maxWidth: 'none' }}
        >
          {selectedPost && (
            <div className="flex flex-col md:flex-row h-full">
              {/* Left Side - Image */}
              <div className="md:w-3/5 bg-black flex items-center justify-center">
                <img
                  src={selectedPost.image_url}
                  alt="Post"
                  className="w-full h-auto max-h-[95vh] object-contain"
                />
              </div>

              {/* Right Side - Post Info */}
              <div className="md:w-2/5 flex flex-col bg-white">
                {/* Post Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                    {selectedPost.author?.username?.substring(0, 2).toUpperCase() || 'ST'}
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900 block">{selectedPost.author?.username || 'Student'}</span>
                    <span className="text-xs text-gray-500">{formatDate(selectedPost.created_at)}</span>
                  </div>
                </div>

                {/* Featured Dish */}
                {selectedPost.featured_dish && (
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold text-gray-900">Featured Dish:</span>
                    </div>
                    <Badge variant="outline" className="mt-2 border-orange-200 text-sm bg-orange-50 text-orange-700">
                      {selectedPost.featured_dish}
                    </Badge>
                  </div>
                )}

                {/* Chapter Reflection */}
                <div className="p-4 flex-1">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">
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
