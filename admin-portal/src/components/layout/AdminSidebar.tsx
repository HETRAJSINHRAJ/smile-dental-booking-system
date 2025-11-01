"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Appointments",
    href: "/appointments",
    icon: Calendar,
  },
  {
    title: "Patients",
    href: "/patients",
    icon: Users,
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

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-card z-50">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              🦷
            </div>
            <span className="text-lg">Admin Panel</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="border-t p-4">
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
        </div>
      </div>
    </aside>
  );
}