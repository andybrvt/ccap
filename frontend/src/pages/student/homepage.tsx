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
  Heart,
  Gift,
  Globe,
  Mail,
  MessageCircle,
  MessageCircle as MessageIcon,
  MoreHorizontal,
  X,
  Loader2,
} from "lucide-react";
import Layout from "@/components/layout/StudentLayout";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { api } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { toast } from "sonner";

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

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
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

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

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

      // Check which posts are liked by current user
      const postsWithLikeStatus = await Promise.all(
        response.data.map(async (post: Post) => {
          try {
            const likeStatus = await api.get(`${API_ENDPOINTS.POSTS_CHECK_LIKED}${post.id}/liked`);
            return { ...post, is_liked: likeStatus.data };
          } catch {
            return { ...post, is_liked: false };
          }
        })
      );

      if (append) {
        setPosts(prev => [...prev, ...postsWithLikeStatus]);
      } else {
        setPosts(postsWithLikeStatus);
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

  // Like/unlike handler
  const handleLikeToggle = async (postId: string, isLiked: boolean, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening post dialog

    try {
      if (isLiked) {
        await api.delete(`${API_ENDPOINTS.POSTS_UNLIKE}${postId}/like`);
      } else {
        await api.post(`${API_ENDPOINTS.POSTS_LIKE}${postId}/like`);
      }

      // Update local state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            is_liked: !isLiked,
            likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1
          };
        }
        return post;
      }));

      // Update selected post if viewing it
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({
          ...selectedPost,
          is_liked: !isLiked,
          likes_count: isLiked ? selectedPost.likes_count - 1 : selectedPost.likes_count + 1
        });
      }
    } catch (error: any) {
      console.error('Failed to toggle like:', error);
      toast.error(error.response?.data?.detail || 'Failed to update like');
    }
  };

  // Open post modal and fetch comments
  const handleOpenPost = async (post: Post) => {
    setSelectedPost(post);
    setIsPostDialogOpen(true);
    setNewComment('');

    // Fetch comments for this post
    try {
      setLoadingComments(true);
      const response = await api.get(`${API_ENDPOINTS.POSTS_GET_COMMENTS}${post.id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to load comments:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Add comment handler
  const handleAddComment = async () => {
    if (!selectedPost || !newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await api.post(
        `${API_ENDPOINTS.POSTS_ADD_COMMENT}${selectedPost.id}/comments`,
        { content: newComment }
      );

      // Add new comment to list
      setComments([...comments, response.data]);
      setNewComment('');

      // Update comments count in posts list
      setPosts(posts.map(post => {
        if (post.id === selectedPost.id) {
          return { ...post, comments_count: post.comments_count + 1 };
        }
        return post;
      }));

      // Update selected post
      setSelectedPost({
        ...selectedPost,
        comments_count: selectedPost.comments_count + 1
      });

      toast.success('Comment added!');
    } catch (error: any) {
      console.error('Failed to add comment:', error);
      toast.error(error.response?.data?.detail || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete comment handler
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await api.delete(`${API_ENDPOINTS.POSTS_DELETE_COMMENT}${commentId}`);

      // Remove comment from list
      setComments(comments.filter(c => c.id !== commentId));

      // Update comments count
      if (selectedPost) {
        setPosts(posts.map(post => {
          if (post.id === selectedPost.id) {
            return { ...post, comments_count: Math.max(0, post.comments_count - 1) };
          }
          return post;
        }));

        setSelectedPost({
          ...selectedPost,
          comments_count: Math.max(0, selectedPost.comments_count - 1)
        });
      }

      toast.success('Comment deleted!');
    } catch (error: any) {
      console.error('Failed to delete comment:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete comment');
    }
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
              CCAP Student Dashboard
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
                    <MessageIcon className="h-4 w-4 text-white" />
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
                      <MessageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">Loading posts...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageIcon className="h-8 w-8 text-gray-400" />
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
                            onClick={(e) => handleLikeToggle(post.id, post.is_liked || false, e)}
                            className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                          >
                            <Heart
                              className={`w-5 h-5 ${post.is_liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                            />
                            <span className="text-sm font-semibold">{post.likes_count}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPost(post);
                            }}
                            className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                          >
                            <MessageCircle className="w-5 h-5 text-gray-600" />
                            <span className="text-sm font-semibold">{post.comments_count}</span>
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
                              {announcement.content}
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
            </div>
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
                Sinatra - CCAP
              </span>
            </div>
            <div className="text-sm text-gray-600">
              © 2025 Sinatra Insurance Group. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Post Dialog with Comments */}
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

              {/* Right Side - Comments */}
              <div className="md:w-2/5 flex flex-col bg-white">
                {/* Post Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold ${user && selectedPost.author?.id && String(user.id) === String(selectedPost.author.id) ? 'cursor-pointer hover:bg-blue-200 transition-colors' : ''
                      }`}
                    onClick={() => selectedPost.author?.id && handleNavigateToProfile(selectedPost.author.id)}
                  >
                    {selectedPost.author?.username?.substring(0, 2).toUpperCase() || 'ST'}
                  </div>
                  <div className="flex-1">
                    <span
                      className={`font-semibold text-gray-900 block ${user && selectedPost.author?.id && String(user.id) === String(selectedPost.author.id) ? 'cursor-pointer hover:underline' : ''
                        }`}
                      onClick={() => selectedPost.author?.id && handleNavigateToProfile(selectedPost.author.id)}
                    >
                      {selectedPost.author?.username || 'Student'}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(selectedPost.created_at)}</span>
                  </div>
                </div>

                {/* Caption */}
                <div className="p-4 border-b">
                  <div className="flex gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold flex-shrink-0 ${user && selectedPost.author?.id && String(user.id) === String(selectedPost.author.id) ? 'cursor-pointer hover:bg-blue-200 transition-colors' : ''
                        }`}
                      onClick={() => selectedPost.author?.id && handleNavigateToProfile(selectedPost.author.id)}
                    >
                      {selectedPost.author?.username?.substring(0, 2).toUpperCase() || 'ST'}
                    </div>
                    <div className="flex-1">
                      <span
                        className={`font-semibold text-gray-900 ${user && selectedPost.author?.id && String(user.id) === String(selectedPost.author.id) ? 'cursor-pointer hover:underline' : ''
                          }`}
                        onClick={() => selectedPost.author?.id && handleNavigateToProfile(selectedPost.author.id)}
                      >
                        {selectedPost.author?.username || 'Student'}
                      </span>
                      <span className="text-gray-900"> {selectedPost.caption}</span>
                      {selectedPost.featured_dish && (
                        <Badge variant="outline" className="mt-2 border-orange-50 border text-xs bg-orange-200 text-orange-700">
                          Featured: {selectedPost.featured_dish}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(95vh - 280px)' }}>
                  {loadingComments ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No comments yet.</p>
                      <p className="text-xs">Be the first to comment!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 group">
                        <div
                          className={`w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0 ${user && comment.user?.id && String(user.id) === String(comment.user.id) ? 'cursor-pointer hover:bg-blue-200 transition-colors' : ''
                            }`}
                          onClick={() => comment.user?.id && handleNavigateToProfile(comment.user.id)}
                        >
                          {comment.user?.username?.substring(0, 2).toUpperCase() || 'ST'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <span
                              className={`font-semibold text-gray-900 text-sm ${user && comment.user?.id && String(user.id) === String(comment.user.id) ? 'cursor-pointer hover:underline' : ''
                                }`}
                              onClick={() => comment.user?.id && handleNavigateToProfile(comment.user.id)}
                            >
                              {comment.user?.username || 'Student'}
                            </span>
                            <p className="text-gray-900 text-sm break-words">{comment.content}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-1 px-3">
                            <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                            {comment.user_id === String(user?.id) && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-xs text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Actions & Comment Input */}
                <div className="border-t p-4 space-y-3">
                  {/* Like Button */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => handleLikeToggle(selectedPost.id, selectedPost.is_liked || false, e)}
                      className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                    >
                      <Heart
                        className={`w-6 h-6 ${selectedPost.is_liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                      />
                      <span className="text-sm font-semibold">{selectedPost.likes_count} likes</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-6 h-6 text-gray-600" />
                      <span className="text-sm font-semibold">{selectedPost.comments_count} comments</span>
                    </div>
                  </div>

                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                      disabled={submittingComment}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submittingComment}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {submittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post'}
                    </Button>
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
