import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { MessageCircle, Loader2, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Layout from "@/components/layout/StudentLayout";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/endpoints";

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

const PAGE_SIZE = 24;

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

export default function StudentCommunityPosts() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await api.get(API_ENDPOINTS.POSTS_GET_ALL, {
          params: { limit: PAGE_SIZE, offset: 0 }
        });
        setPosts(response.data);
        setHasMore(response.data.length === PAGE_SIZE);
        setOffset(PAGE_SIZE);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const response = await api.get(API_ENDPOINTS.POSTS_GET_ALL, {
        params: { limit: PAGE_SIZE, offset }
      });
      setPosts(prev => [...prev, ...response.data]);
      setHasMore(response.data.length === PAGE_SIZE);
      setOffset(prev => prev + response.data.length);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleOpenPost = (post: Post) => {
    setSelectedPost(post);
    setIsPostDialogOpen(true);
  };

  // Students can only navigate to their own portfolio
  const isOwnPost = (post: Post) =>
    Boolean(user && post.author?.id && String(user.id) === String(post.author.id));

  const handleNavigateToProfile = (userId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    if (user && String(user.id) === String(userId)) {
      setLocation('/student/portfolio');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-[28px] font-semibold text-ink tracking-tight">Community Posts</h1>
          <p className="text-[15px] text-inkmuted mt-1">Cooking photos shared by students across the program</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-[10px] border border-line p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-secondary animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-secondary rounded animate-pulse w-1/2" />
                    <div className="h-3 bg-secondary rounded animate-pulse w-1/3" />
                  </div>
                </div>
                <div className="aspect-video bg-secondary rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-[10px] border border-line p-12 text-center">
            <MessageCircle className="h-8 w-8 text-inkmuted/50 mx-auto mb-3" />
            <p className="text-[15px] text-inkmuted">No student posts yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handleOpenPost(post)}
                  className="group bg-white border border-line rounded-[10px] p-4 shadow-card cursor-pointer transition-all duration-200 hover:border-brand flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-9 h-9 rounded-full bg-secondary border border-line flex items-center justify-center text-ink text-sm font-semibold flex-shrink-0 ${isOwnPost(post) ? 'cursor-pointer hover:border-brand transition-colors' : ''}`}
                      onClick={(e) => post.author?.id && handleNavigateToProfile(post.author.id, e)}
                    >
                      {post.author?.username?.substring(0, 2).toUpperCase() || 'ST'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`font-medium text-[15px] text-ink block truncate ${isOwnPost(post) ? 'cursor-pointer hover:underline' : ''}`}
                        onClick={(e) => post.author?.id && handleNavigateToProfile(post.author.id, e)}
                      >
                        {post.author?.username || 'Student'}
                      </span>
                      <span className="text-[13px] text-inkmuted">{formatDate(post.created_at)}</span>
                    </div>
                  </div>

                  <div className="rounded-lg overflow-hidden mb-3 aspect-video bg-secondary">
                    <img
                      src={post.image_url}
                      alt="Post"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                    />
                  </div>

                  {post.caption && (
                    <p className="text-ink text-[15px] mb-2 line-clamp-2">{post.caption}</p>
                  )}

                  {post.featured_dish && (
                    <span className="inline-flex items-center self-start rounded-md bg-warning-soft text-warning text-[13px] font-medium px-2 py-0.5 mt-auto">
                      Featured: {post.featured_dish}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="text-center pt-8">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="border-line bg-white text-ink hover:bg-secondary px-8"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load more posts'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

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
                <div className="p-4 border-b border-line flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary border border-line flex items-center justify-center text-ink font-semibold">
                    {selectedPost.author?.username?.substring(0, 2).toUpperCase() || 'ST'}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-ink block">{selectedPost.author?.username || 'Student'}</span>
                    <span className="text-[13px] text-inkmuted">{formatDate(selectedPost.created_at)}</span>
                  </div>
                </div>

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

                <div className="p-4 flex-1">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary border border-line flex items-center justify-center text-ink font-semibold flex-shrink-0">
                      {selectedPost.author?.username?.substring(0, 2).toUpperCase() || 'ST'}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-ink">{selectedPost.author?.username || 'Student'} </span>
                      <span className="text-ink">{selectedPost.caption}</span>
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
