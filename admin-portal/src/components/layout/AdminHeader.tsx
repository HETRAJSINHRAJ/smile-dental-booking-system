"use client";

import { usePathname } from "next/navigation";
import { Calendar, Users, UserCog, Briefcase, LayoutDashboard, MessageSquare, Clock } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const pageInfo: Record<string, { title: string; description: string; icon: any }> = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'Overview of your dental practice',
    icon: LayoutDashboard,
  },
  '/appointments': {
    title: 'Appointments',
    description: 'Manage patient appointments and schedules',
    icon: Calendar,
  },
  '/patients': {
    title: 'Patients',
    description: 'Manage patient information and records',
    icon: Users,
  },
  '/providers': {
    title: 'Providers',
    description: 'Manage dental providers and staff',
    icon: UserCog,
  },
  '/manage-services': {
    title: 'Services',
    description: 'Manage dental services and pricing',
    icon: Briefcase,
  },
  '/chat': {
    title: 'Chat',
    description: 'Manage patient conversations and support',
    icon: MessageSquare,
  },
  '/waitlist': {
    title: 'Waitlist',
    description: 'Manage patient waitlist and notifications',
    icon: Clock,
  },
};

export default function AdminHeader() {
  const pathname = usePathname();
  const currentPage = pageInfo[pathname || '/dashboard'];
  const Icon = currentPage?.icon || LayoutDashboard;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {currentPage?.title || 'Admin Panel'}
            </h1>
            <p className="text-sm text-gray-600">
              {currentPage?.description || 'Manage your dental practice'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <NotificationBell />
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-xs text-gray-600">
              {new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}