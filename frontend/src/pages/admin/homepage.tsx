import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Loader2,
  Utensils,
  MessageCircle,
} from "lucide-react";
import Layout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { api } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/endpoints";
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

// Dummy posts data - WILL BE REPLACED WITH API
const dummyPosts = [
  {
    id: 1,
    user: {
      name: "Jordan Lee",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      handle: "@jordan_chef",
      bucket: "Pre-Apprentice"
    },
    content: "Culinary competition day! The pressure is real but so is the excitement. Learning to work under pressure is crucial in this industry. 💪 #Competition #Culinary",
    image: "https://images.unsplash.com/photo-1571805529673-0f56b922b359?auto=format&fit=crop&w=600&q=80",
    likes: 38,
    comments: 14,
    shares: 6,
    timestamp: "2 days ago",
    dish: "Competition Entry"
  },
  {
    id: 2,
    user: {
      name: "Marcus Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      handle: "@marcus_cooks",
      bucket: "Apprentice"
    },
    content: "Today's lesson: The perfect risotto. It's all about patience and constant stirring. Chef says it should flow like lava! 🍚 #Risotto #CookingBasics",
    image: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=600&q=80",
    likes: 18,
    comments: 5,
    shares: 2,
    timestamp: "4 hours ago",
    dish: "Risotto Milanese"
  },
  {
    id: 3,
    user: {
      name: "Emma Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      handle: "@emma_bakes",
      bucket: "Pre-Apprentice"
    },
    content: "First time making croissants from scratch! The lamination process is so therapeutic. Can't wait to perfect this technique. 🥐 #Baking #Pastry",
    image: "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?auto=format&fit=crop&w=600&q=80",
    likes: 31,
    comments: 12,
    shares: 7,
    timestamp: "6 hours ago",
    dish: "Croissants"
  },
  {
    id: 4,
    user: {
      name: "David Kim",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      handle: "@david_kitchen",
      bucket: "Completed Pre-Apprentice"
    },
    content: "Kitchen teamwork makes the dream work! Nothing beats the energy of a busy service. Everyone has their role and we move like a well-oiled machine. 👨‍🍳 #Teamwork #KitchenLife",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=600&q=80",
    likes: 42,
    comments: 15,
    shares: 9,
    timestamp: "8 hours ago",
    dish: "Team Service"
  },
  {
    id: 5,
    user: {
      name: "Lisa Thompson",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      handle: "@lisa_culinary",
      bucket: "Apprentice"
    },
    content: "Today's challenge: Plating with precision. Every element has its place, every sauce has its purpose. The art of presentation is just as important as taste. 🎨 #Plating #CulinaryArts",
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80",
    likes: 28,
    comments: 9,
    shares: 4,
    timestamp: "1 day ago",
    dish: "Plating Practice"
  },
  {
    id: 6,
    user: {
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      handle: "@alex_pastry",
      bucket: "Completed Apprentice"
    },
    content: "Pastry perfection achieved! The key is temperature control and timing. These macarons took 3 attempts but finally got the perfect feet. 🍪 #Pastry #Macarons",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80",
    likes: 56,
    comments: 23,
    shares: 12,
    timestamp: "1 day ago",
    dish: "Macarons"
  },
  {
    id: 7,
    user: {
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      handle: "@sarah_chef",
      bucket: "Completed Apprentice"
    },
    content: "Just finished plating my final project for the semester! The attention to detail in French cuisine is incredible. #CulinaryArts #Plating",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80",
    likes: 24,
    comments: 8,
    shares: 3,
    timestamp: "2 hours ago",
    dish: "Beef Wellington"
  },
  {
    id: 8,
    user: {
      name: "Maya Patel",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      handle: "@maya_cooks",
      bucket: "Apprentice"
    },
    content: "Learning from the best! Chef's demonstration on knife skills today was incredible. Speed comes with practice, but precision comes with focus. 🔪 #KnifeSkills #CulinaryBasics",
    image: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&w=600&q=80",
    likes: 22,
    comments: 7,
    shares: 3,
    timestamp: "2 days ago",
    dish: "Knife Skills"
  },
  {
    id: 9,
    user: {
      name: "Ryan Foster",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      handle: "@ryan_kitchen",
      bucket: "Completed Pre-Apprentice"
    },
    content: "Group project success! Our team nailed the menu planning and execution. Collaboration is everything in the kitchen. Everyone brought their A-game today! 👨‍🍳👩‍🍳 #Teamwork #Success",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80",
    likes: 45,
    comments: 18,
    shares: 8,
    timestamp: "3 days ago",
    dish: "Group Menu"
  },
  {
    id: 10,
    user: {
      name: "Sophie Williams",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      handle: "@sophie_final",
      bucket: "Completed Apprentice"
    },
    content: "Final presentation complete! Four years of hard work, late nights, and countless hours in the kitchen have led to this moment. Proud to be a C•CAP graduate! 🎓 #Graduation #CulinaryArts",
    image: "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=600&q=80",
    likes: 89,
    comments: 34,
    shares: 21,
    timestamp: "3 days ago",
    dish: "Final Presentation"
  }
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


  // Fetch announcements
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

  // Fetch posts (initial load)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoadingPosts(true);
        const response = await api.get(API_ENDPOINTS.POSTS_GET_ALL, {
          params: { limit: 4, offset: 0 }
        });
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, []);

  // Open post modal
  const handleOpenPost = async (post: Post) => {
    setSelectedPost(post);
    setIsPostDialogOpen(true);
  };

  // Navigate to student portfolio
  const handleNavigateToPortfolio = (userId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setLocation(`/admin/portfolio/${userId}`);
  };

  return (
    <Layout>
      {/* Dashboard Hero */}
      <section className="px-6 py-8">
        <div className="max-w-7xl w-full mx-auto">
          <div className="flex lg:flex-row flex-col md:justify-between justify-start gap-2 lg:items-center items-start mb-8">
            <h1 className="text-[28px] font-semibold text-ink tracking-tight">
              C•CAP Application Management System
            </h1>
            <p className="text-[15px] text-inkmuted">
              Welcome back{user?.full_name ? `, ${user.full_name}` : ""}
            </p>
          </div>

          {/* CTA cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Submissions Card */}
            <Link href="/admin/submissions">
              <div className="group h-full bg-white rounded-[10px] border border-line shadow-card p-6 flex items-center gap-5 cursor-pointer transition-all duration-200 hover:border-brand hover:-translate-y-0.5">
                <div className="w-12 h-12 bg-brand-soft rounded-[10px] flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-ink mb-0.5">Submissions</h2>
                  <p className="text-[15px] text-inkmuted">View and manage all your applications</p>
                </div>
                <ChevronRight className="h-5 w-5 text-inkmuted group-hover:text-brand group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
              </div>
            </Link>

            {/* Portfolio Lookup Card */}
            <Link href="/admin/portfolio-lookup">
              <div className="group h-full bg-white rounded-[10px] border border-line shadow-card p-6 flex items-center gap-5 cursor-pointer transition-all duration-200 hover:border-brand hover:-translate-y-0.5">
                <div className="w-12 h-12 bg-brand-soft rounded-[10px] flex items-center justify-center flex-shrink-0">
                  <Search className="h-5 w-5 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-ink mb-0.5">Portfolio Lookup</h2>
                  <p className="text-[15px] text-inkmuted">View students portfolio</p>
                </div>
                <ChevronRight className="h-5 w-5 text-inkmuted group-hover:text-brand group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Posts and Announcements */}
      <section className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Posts Column */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="h-[18px] w-[18px] text-inkmuted" />
                  <h2 className="text-lg font-semibold text-ink">Community Posts</h2>
                </div>
                <Link
                  href="/admin/community-posts"
                  className="text-sm font-medium text-brand hover:underline"
                >
                  View all →
                </Link>
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
                    <p className="text-[15px] text-inkmuted">No student posts yet.</p>
                  </div>
                ) : (
                  <>
                    {posts.slice(0, 4).map((post) => (
                      <div
                        key={post.id}
                        onClick={() => handleOpenPost(post)}
                        className="group bg-white border border-line rounded-[10px] p-4 shadow-card cursor-pointer transition-all duration-200 hover:border-brand"
                      >
                        {/* Post Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-9 h-9 rounded-full bg-secondary border border-line flex items-center justify-center text-ink text-sm font-semibold cursor-pointer hover:border-brand transition-colors"
                            onClick={(e) => post.author?.id && handleNavigateToPortfolio(post.author.id, e)}
                          >
                            {post.author?.username?.substring(0, 2).toUpperCase() || 'ST'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span
                              className="font-medium text-[15px] text-ink block cursor-pointer hover:underline truncate"
                              onClick={(e) => post.author?.id && handleNavigateToPortfolio(post.author.id, e)}
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
                  </>
                )}
              </div>
            </div>

            {/* Announcements Column */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Megaphone className="h-[18px] w-[18px] text-inkmuted" />
                  <h2 className="text-lg font-semibold text-ink">Announcements</h2>
                </div>
                <Link
                  href="/admin/announcements"
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
                    <p className="text-[15px] text-inkmuted">There are no announcements at this time.</p>
                  </div>
                ) : (
                  announcements.slice(0, 4).map((announcement) => (
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
                          <div className="flex items-center gap-1.5 flex-wrap">
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
                  ))
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
                  <div className="p-4 border-b">
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
