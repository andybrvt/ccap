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
    content: "Final presentation complete! Four years of hard work, late nights, and countless hours in the kitchen have led to this moment. Proud to be a C-CAP graduate! 🎓 #Graduation #CulinaryArts",
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
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [postsOffset, setPostsOffset] = useState(0);


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
          params: { limit: 10, offset: 0 }
        });
        setPosts(response.data);
        setHasMorePosts(response.data.length === 10);
        setPostsOffset(10);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, []);

  // Load more posts
  const handleLoadMorePosts = async () => {
    if (loadingMorePosts || !hasMorePosts) return;

    try {
      setLoadingMorePosts(true);
      const response = await api.get(API_ENDPOINTS.POSTS_GET_ALL, {
        params: { limit: 10, offset: postsOffset }
      });

      setPosts([...posts, ...response.data]);
      setHasMorePosts(response.data.length === 10);
      setPostsOffset(postsOffset + response.data.length);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMorePosts(false);
    }
  };

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
      <section className="px-6 py-8 bg-gray-50">
        <div className="max-w-7xl w-full mx-auto">
          <div className="flex lg:flex-row flex-col md:justify-between justify-start gap-4 items-center mb-6">
            <p className="text-3xl font-bold text-black">
              C-CAP Application Management System
            </p>
            <p className="text-xl font-medium text-gray-800">
              Welcome back, {user?.full_name}
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
                    <p className="text-gray-600">No student posts yet.</p>
                  </div>
                ) : (
                  <div className="max-h-[550px] overflow-y-auto scrollbar-hide space-y-3">
                    {posts.map((post) => (
                      <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        {/* Post Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold cursor-pointer hover:bg-blue-200 transition-colors"
                              onClick={(e) => post.author?.id && handleNavigateToPortfolio(post.author.id, e)}
                            >
                              {post.author?.username?.substring(0, 2).toUpperCase() || 'ST'}
                            </div>
                            <div className="flex-1">
                              <span
                                className="font-semibold text-gray-900 block cursor-pointer hover:underline"
                                onClick={(e) => post.author?.id && handleNavigateToPortfolio(post.author.id, e)}
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
                          <p className="text-gray-900 text-sm mb-2 line-clamp-2">{post.caption}</p>
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
                            onClick={handleLoadMorePosts}
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
                  href="/admin/announcements"
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
                    <p className="text-gray-600">There are no announcements at this time. Check back later for updates.</p>
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
    </Layout>
  );
}
