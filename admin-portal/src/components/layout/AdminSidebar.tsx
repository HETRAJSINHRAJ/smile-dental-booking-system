"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserCog, 
  Briefcase, 
  Clock, 
  Settings, 
  BarChart3,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CalendarPlus,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  FileText,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Appointments",
    icon: Calendar,
    expandable: true,
    subItems: [
      {
        title: "All Appointments",
        href: "/appointments",
        icon: CalendarCheck,
      },
      {
        title: "Create Appointment",
        href: "/appointments/create",
        icon: CalendarPlus,
      },
      {
        title: "Cancelled",
        href: "/appointments/cancelled",
        icon: CalendarX,
      },
      {
        title: "Schedule",
        href: "/appointments/schedule",
        icon: CalendarClock,
      },
    ],
  },
  {
    title: "Patients",
    icon: Users,
    expandable: true,
    subItems: [
      {
        title: "All Patients",
        href: "/patients",
        icon: Users,
      },
      {
        title: "Patient Records",
        href: "/patients/records",
        icon: FileText,
      },
      {
        title: "Medical History",
        href: "/patients/medical-history",
        icon: Heart,
      },
      {
        title: "Patient Analytics",
        href: "/patients/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Providers",
    href: "/providers",
    icon: UserCog,
  },
  {
    title: "Services",
    href: "/manage-services",
    icon: Briefcase,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, signOut } = useAuth();
  const { isExpanded, toggleSidebar } = useSidebar();
  
  // Initialize with appropriate sections expanded based on current path
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    const expanded = [];
    if (pathname?.startsWith('/appointments')) {
      expanded.push('Appointments');
    }
    if (pathname?.startsWith('/patients')) {
      expanded.push('Patients');
    }
    return expanded;
  });

  // Helper function for precise route matching
  const isRouteActive = (itemHref: string, currentPath: string) => {
    // Exact match
    if (currentPath === itemHref) return true;
    
    // Special handling for root routes like /appointments and /patients
    if (itemHref === "/appointments" || itemHref === "/patients") {
      // Only match if it's exactly the root path, not sub-paths
      return currentPath === itemHref;
    }
    
    // For sub-routes, check if current path starts with item href + "/"
    if (currentPath.startsWith(itemHref + "/")) {
      return true;
    }
    
    return false;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  // Auto-expand sections when navigating to their pages
  useEffect(() => {
    const newExpanded = [];
    
    if (pathname?.startsWith('/appointments') && !expandedItems.includes('Appointments')) {
      newExpanded.push('Appointments');
    }
    
    if (pathname?.startsWith('/patients') && !expandedItems.includes('Patients')) {
      newExpanded.push('Patients');
    }
    
    if (newExpanded.length > 0) {
      setExpandedItems(prev => [...prev, ...newExpanded]);
    }
  }, [pathname]);

  return (
    <aside className={`fixed left-0 top-0 h-screen border-r bg-card z-50 transition-all duration-300 ${
      isExpanded ? 'w-64' : 'w-16'
    }`}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {isExpanded ? (
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                🦷
              </div>
              <span className="text-lg">Admin Panel</span>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center justify-center w-full">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                🦷
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-1 h-8 w-8"
          >
            {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isExpanded_item = expandedItems.includes(item.title);
              
              if (item.expandable && item.subItems) {
                // Expandable menu item - More precise active detection
                const isAnySubItemActive = item.subItems.some(subItem => 
                  isRouteActive(subItem.href, pathname || '')
                );
                
                return (
                  <div key={item.title}>
                    {/* Parent item */}
                    <button
                      onClick={() => {
                        if (!isExpanded) {
                          toggleSidebar();
                          setTimeout(() => toggleExpanded(item.title), 100);
                        } else {
                          toggleExpanded(item.title);
                        }
                      }}
                      className={cn(
                        "w-full flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isExpanded ? "gap-3" : "justify-center",
                        isAnySubItemActive
                          ? "bg-primary/10 text-primary border border-primary/15 shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
                        !isExpanded && "hover:scale-105"
                      )}
                      title={!isExpanded ? item.title : undefined}
                    >
                      <div className="relative">
                        <Icon className="h-4 w-4 shrink-0" />
                        {!isExpanded && isAnySubItemActive && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      {isExpanded && (
                        <>
                          <span className="flex-1 text-left font-medium">{item.title}</span>
                          <div className={cn(
                            "transition-transform duration-200",
                            isExpanded_item && "rotate-180"
                          )}>
                            <ChevronDown className="h-4 w-4 shrink-0" />
                          </div>
                        </>
                      )}
                    </button>
                    
                    {/* Sub items */}
                    {isExpanded && (
                      <div className={cn(
                        "ml-6 mt-2 space-y-1 border-l border-border/50 pl-3 overflow-hidden transition-all duration-300",
                        isExpanded_item ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      )}>
                        {item.subItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          // More precise active state detection
                          const isSubActive = isRouteActive(subItem.href, pathname || '');
                          
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={cn(
                                "flex items-center rounded-md px-3 py-2 text-sm transition-all duration-200 gap-3 relative",
                                isSubActive
                                  ? "bg-primary/20 text-primary shadow-sm font-medium border border-primary/30"
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-1"
                              )}
                            >
                              <SubIcon className="h-4 w-4 shrink-0" />
                              <span className="truncate">{subItem.title}</span>
                              {isSubActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-full" />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              } else {
                // Regular menu item
                const isActive = isRouteActive(item.href!, pathname || '');
                
                return (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isExpanded ? "gap-3" : "justify-center",
                      isActive
                        ? "bg-primary/20 text-primary shadow-sm border border-primary/30"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
                      !isExpanded && "hover:scale-105"
                    )}
                    title={!isExpanded ? item.title : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {isExpanded && <span className="truncate">{item.title}</span>}
                  </Link>
                );
              }
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="border-t p-4">
          {isExpanded ? (
            <>
              <div className="mb-3 flex items-center gap-3 rounded-lg bg-muted p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {userProfile?.displayName?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{userProfile?.displayName || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground truncate">{userProfile?.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                {userProfile?.displayName?.charAt(0).toUpperCase() || 'A'}
              </div>
              <Button variant="outline" size="sm" className="p-2" onClick={handleSignOut} title="Sign Out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}