'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Calendar, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userProfile, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="bg-white dark:bg-card shadow-md sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-3xl">🦷</span>
            <span className="text-xl font-bold text-blue-600">Smile Dental</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground hover:text-blue-600 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    <span>{userProfile?.displayName || user.email}</span>
                  </Button>
                </Link>
                <Link href="/booking">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Book</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 hover:text-red-600">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/booking">
                  <Button size="sm" className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                    <Calendar className="w-4 h-4" />
                    Book Appointment
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground hover:text-blue-600 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-foreground hover:text-blue-600 transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="border-t pt-4">
                {loading ? (
                  <div className="flex justify-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 text-foreground hover:text-blue-600 transition-colors mb-4"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span>{userProfile?.displayName || user.email}</span>
                    </Link>
                    <Link
                      href="/booking"
                      className="flex items-center gap-2 text-foreground hover:text-blue-600 transition-colors mb-4"
                      onClick={() => setIsOpen(false)}
                    >
                      <Calendar className="w-5 h-5" />
                      <span>Book Appointment</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2 text-foreground hover:text-red-600 transition-colors w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="block text-foreground hover:text-blue-600 transition-colors font-medium mb-4"
                      onClick={() => setIsOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link
                      href="/booking"
                      className="block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-cyan-700 transition-colors text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Book Appointment
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}