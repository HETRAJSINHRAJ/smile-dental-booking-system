import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleOAuthProvider } from "@/components/auth/GoogleOAuthProvider";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smile Dental - Your Trusted Dental Care Partner",
  description: "Experience exceptional dental care with our expert team. From routine checkups to smile transformations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleOAuthProvider>
          <AuthProvider>
            <WebVitalsReporter />
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
            <Toaster />
            <CookieConsent />
            <ChatWidget />
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}

