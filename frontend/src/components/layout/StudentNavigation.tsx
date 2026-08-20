import { Link, useLocation } from "wouter";
import { ChevronDown, Home, FileText, User, LogOut, Megaphone, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";

// Navigation items JSON
const navItems = [
  {
    label: "Home",
    href: "/student",
    icon: Home,
  },
  {
    label: "Portfolio",
    href: "/student/portfolio",
    icon: FileText,
  },
  {
    label: "Announcements",
    href: "/student/announcements",
    icon: Megaphone,
  },
  // Add more items as needed
];

export function Navigation() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  // Safely access user properties with fallbacks
  const userName = user?.full_name || user?.email;
  const userEmail = user?.email;
  const userInitial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  const isActive = (path: string) => {
    if (path === "/student" && location === "/student") return true;
    if (path !== "/student" && location.startsWith(path)) return true;
    return false;
  };

  const handleSignOut = () => {
    logout();
    setLocation('/login');
  };

  return (
    <div className="bg-white border-b border-line sticky top-0 z-40 flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => setLocation("/student")}
            className="cursor-pointer flex items-center flex-shrink-0"
          >
            <img
              src="/ccap-logo.png"
              alt="C•CAP Logo"
              className="h-8 w-auto"
            />
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link href={item.href} key={item.href}>
                <Button
                  variant="ghost"
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-full ${isActive(item.href)
                    ? "text-brand bg-brand-soft hover:bg-brand-soft hover:text-brand"
                    : "text-inkmuted hover:bg-secondary hover:text-ink"
                    }`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile - hamburger with slide-in panel */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-ink hover:bg-secondary p-2"
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-6 bg-white">
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-secondary rounded-full mx-auto mb-3 flex items-center justify-center border border-line">
                      <span className="text-ink font-semibold text-lg">{userInitial}</span>
                    </div>
                    <h3 className="text-[15px] font-semibold text-ink mb-0.5">{userName}</h3>
                    <p className="text-[13px] text-inkmuted">{userEmail}</p>
                  </div>

                  <div className="space-y-1 mb-6">
                    {navItems.map((item) => (
                      <Link
                        href={item.href}
                        key={item.href}
                        className={`flex items-center gap-3 px-3 h-10 text-sm rounded-lg transition-colors ${isActive(item.href)
                          ? "text-brand bg-brand-soft font-medium"
                          : "text-ink hover:bg-secondary"
                          }`}
                      >
                        {item.icon && <item.icon className="w-4 h-4" />}
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full justify-center text-danger border-line hover:bg-danger-soft hover:text-danger"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop - profile dropdown */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 text-ink hover:bg-secondary px-2.5 py-1.5 h-auto rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar with initials */}
                      <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center border border-line">
                        <span className="text-ink font-semibold text-sm">
                          {userInitial}
                        </span>
                      </div>

                      {/* User info */}
                      <div className="text-left">
                        <div className="font-medium text-ink text-sm leading-tight">{userName}</div>
                        <div className="text-inkmuted text-xs leading-tight">{userEmail}</div>
                      </div>

                      {/* Dropdown arrow */}
                      <ChevronDown className="w-4 h-4 text-inkmuted transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-60 mt-2 bg-white border border-line shadow-card rounded-lg p-1.5"
                >
                  <div className="px-3 py-2.5 border-b border-line mb-1.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-ink rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {userInitial}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-ink text-sm truncate">{userName}</div>
                        <div className="text-inkmuted text-xs truncate">{userEmail}</div>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/student/portfolio" className="flex items-center gap-3 px-3 h-10 cursor-pointer rounded-md hover:bg-secondary">
                      <User className="w-4 h-4 text-inkmuted" />
                      <span className="text-sm text-ink">My Portfolio</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-line my-1.5" />
                  <DropdownMenuItem
                    className="flex items-center gap-3 px-3 h-10 cursor-pointer rounded-md text-danger hover:bg-danger-soft focus:bg-danger-soft focus:text-danger"
                    onClick={handleSignOut}
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
  );
}
