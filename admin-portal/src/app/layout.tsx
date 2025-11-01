'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { AdminGuard } from "@/components/layout/AdminGuard";
import { usePathname } from "next/navigation";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <div className="admin-layout flex h-screen bg-muted/30">
        <AdminSidebar />
        <main className="flex-1 ml-64 overflow-y-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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

