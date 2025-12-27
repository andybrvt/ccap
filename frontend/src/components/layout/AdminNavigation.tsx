import { Link, useLocation } from "wouter";
import { Building2, ChevronDown, Home, FileText, User, Settings, LogOut, Calculator, Search, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

// Navigation items JSON
const navItems = [
  {
    label: "Home",
    href: "/admin",
    icon: Home,
  },
  {
    label: "Submissions",
    href: "/admin/submissions",
    icon: FileText,
  },
  {
    label: "Portfolio Lookup",
    href: "/admin/portfolio-lookup",
    icon: FileText,
  },
  // Add more items as needed
];

export function Navigation() {
  const [location, setLocation] = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();

  // Safely access user properties with fallbacks
  const userName = user?.full_name || user?.email;
  const userEmail = user?.email;
  const userInitial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isActive = (path: string) => {
    if (path === "/admin" && location === "/admin") return true;
    if (path !== "/admin" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40 flex-shrink-0">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              onClick={() => setLocation("/admin")}
              className="cursor-pointer flex items-center"
            >
              <img
                src="/ccap-logo.png"
                alt="C•CAP Logo"
                className="h-8 w-auto"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Navigation Links - Desktop only */}
            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <Link href={item.href} key={item.href}>
                  <Button
                    variant="ghost"
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${isActive(item.href)
                      ? "text-black bg-gray-100"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* User Profile - Responsive */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Mobile/Tablet - Avatar only with side sheet */}
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:bg-gray-100 p-1"
                    >
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 p-6 bg-white">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{userName}</h3>
                      <p className="text-sm text-gray-500">{userEmail}</p>
                    </div>

                    <div className="space-y-3 mb-6">
                      <h4 className="text-sm font-medium text-gray-900">Navigation</h4>
                      <div className="space-y-1">
                        {navItems.map((item) => (
                          <Link href={item.href} key={item.href} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                            {item.icon && <item.icon className="w-4 h-4 text-gray-500" />}
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full justify-center"
                      onClick={() => {
                        logout();
                        setLocation('/login');
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop - Sleek profile dropdown exactly like reference */}
              <div className="hidden lg:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-3 text-gray-900 hover:bg-gray-50 px-3 py-2 h-auto rounded-lg transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar with initials */}
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                          <span className="text-gray-900 font-semibold text-sm">
                            {userInitial}
                          </span>
                        </div>

                        {/* User info */}
                        <div className="text-left">
                          <div className="font-medium text-gray-900 text-sm leading-tight">{userName}</div>
                          <div className="text-gray-500 text-xs leading-tight">{userEmail}</div>
                        </div>

                        {/* Dropdown arrow */}
                        <ChevronDown className="w-4 h-4 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-56 mt-2 bg-white border border-gray-200 shadow-lg rounded-lg"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {userInitial}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{userName}</div>
                          <div className="text-gray-500 text-xs">{userEmail}</div>
                        </div>
                      </div>
                    </div>
                    {/* Dynamically render navItems as dropdown links */}
                    {navItems.map((item) => (
                      <DropdownMenuItem asChild key={item.href}>
                        <Link href={item.href} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50">
                          {item.icon && <item.icon className="w-4 h-4 text-gray-500" />}
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    {/* Static profile/settings/sign out */}
                    <DropdownMenuItem asChild>
                      <Link href="/admin/admin-management" className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50">
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Admin Management</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/email-notifications" className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Email Notifications</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-100" />
                    <DropdownMenuItem
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-red-50 text-red-600"
                      onClick={() => {
                        logout();
                        setLocation('/login');
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}