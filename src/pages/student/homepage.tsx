import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
} from "lucide-react";
import Layout from "@/components/layout/StudentLayout";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

// Dummy posts data
const posts = [
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

// Dummy announcements data
const announcements = [
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

export default function Homepage() {
  const { user, logout } = useAuth();
  const [selectedPost, setSelectedPost] = useState<typeof posts[0] | null>(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  return (
    <Layout>
      {/* Dashboard Hero */}
      <section className="px-6 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-black mb-3">
              CCAP Student Dashboard
            </h1>
            <h1 className="text-2xl font-medium text-gray-600 mb-3">
              Welcome back, {user?.full_name}
            </h1>
            {/* <p className="text-lg text-gray-600">
              CCAP Application Management System
            </p> */}
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
                {posts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts</h3>
                    <p className="text-gray-600">There are no posts at this time. Check back later for updates.</p>
                  </div>
                ) : (
                  <div className="max-h-[600px] overflow-y-auto">
                    {posts.map((post) => (
                      <div key={post.id} className="border-b border-gray-100 last:border-b-0">
                        <div
                          className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedPost(post);
                            setIsPostDialogOpen(true);
                          }}
                        >
                          {/* Post Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={post.user.avatar}
                                alt={post.user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900">{post.user.name}</span>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${post.user.bucket === 'Pre-Apprentice' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                        post.user.bucket === 'Apprentice' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                          post.user.bucket === 'Completed Pre-Apprentice' ? 'bg-green-50 text-green-700 border-green-200' :
                                            post.user.bucket === 'Completed Apprentice' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                              'bg-gray-50 text-gray-700 border-gray-200'
                                      }`}
                                  >
                                    {post.user.bucket}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <span>{post.timestamp}</span>
                                </div>
                              </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Post Content */}
                          <div className="mb-3">
                            <p className="text-gray-900 mb-3">{post.content}</p>
                            {post.image && (
                              <div className="rounded-lg overflow-hidden mb-3">
                                <img
                                  src={post.image}
                                  alt="Post"
                                  className="w-full h-48 object-cover"
                                />
                              </div>
                            )}
                            {post.dish && (
                              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                                Featured: {post.dish}
                              </Badge>
                            )}
                          </div>


                        </div>
                      </div>
                    ))}
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
                {announcements.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Megaphone className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Announcements</h3>
                    <p className="text-gray-600">There are no announcements at this time. Check back later for updates.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-start">
                          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                            {renderAnnouncementIcon(announcement.icon)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-black mb-1">
                              {announcement.title}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              {announcement.description}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-xs text-gray-500">
                                {announcement.date}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={announcement.priority === 'high' ? 'destructive' : announcement.priority === 'medium' ? 'secondary' : 'outline'}
                                className="text-xs"
                              >
                                {announcement.priority === 'high' ? 'Important' : announcement.priority === 'medium' ? 'Notice' : 'Info'}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs border-gray-300 text-gray-600"
                              >
                                {announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}
                              </Badge>
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

      {/* Post Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="max-w-2xl w-full p-0">
          {selectedPost && (
            <div className="p-6">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedPost.user.avatar}
                    alt={selectedPost.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-lg">{selectedPost.user.name}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${selectedPost.user.bucket === 'Pre-Apprentice' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            selectedPost.user.bucket === 'Apprentice' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              selectedPost.user.bucket === 'Completed Pre-Apprentice' ? 'bg-green-50 text-green-700 border-green-200' :
                                selectedPost.user.bucket === 'Completed Apprentice' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                  'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                      >
                        {selectedPost.user.bucket}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{selectedPost.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-gray-900 text-base mb-4 leading-relaxed">{selectedPost.content}</p>
                {selectedPost.image && (
                  <div className="rounded-lg overflow-hidden mb-4">
                    <img
                      src={selectedPost.image}
                      alt="Post"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
                {selectedPost.dish && (
                  <Badge variant="outline" className="text-sm bg-gray-50 text-gray-700 border-gray-200">
                    Featured: {selectedPost.dish}
                  </Badge>
                )}
              </div>


            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
