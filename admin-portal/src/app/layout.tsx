'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";
import { AdminGuard } from "@/components/layout/AdminGuard";
import { usePathname } from "next/navigation";
import Head from "next/head";
import { useEffect } from "react";
import { reportWebVitals } from "@/lib/performance/webVitals";
import { observeLongTasks } from "@/lib/performance/sentryTransactions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebar();
  
  return (
    <div className="admin-layout flex h-screen bg-muted/30">
      <AdminSidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isExpanded ? 'ml-64' : 'ml-16'
      }`}>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  // For auth pages, render without AdminGuard and AdminSidebar
  if (isAuthPage) {
    return <>{children}</>;
  }

  // For protected pages, wrap with AdminGuard and show sidebar
  return (
    <AdminGuard>
      <SidebarProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </SidebarProvider>
    </AdminGuard>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize web vitals and performance monitoring on mount
  useEffect(() => {
    reportWebVitals();
    
    // Start observing long tasks for performance monitoring
    const cleanup = observeLongTasks();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <title>Smile Dental - Admin Panel</title>
        <meta name="description" content="Admin management panel for Smile Dental booking system." />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

