"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, linkProvider, unlinkProvider, getLinkedProviders } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const linkedProviders = getLinkedProviders();
  const hasPassword = linkedProviders.includes('password');
  const hasGoogle = linkedProviders.includes('google.com');
  const hasFacebook = linkedProviders.includes('facebook.com');

  const handleLinkProvider = async (provider: 'google' | 'facebook') => {
    setLoading(provider);
    try {
      await linkProvider(provider);
    } catch (error) {
      console.error("Error linking provider:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleUnlinkProvider = async (providerId: string) => {
    setLoading(providerId);
    try {
      await unlinkProvider(providerId);
    } catch (error) {
      console.error("Error unlinking provider:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and linked sign-in methods
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Linked Accounts</CardTitle>
          <CardDescription>
            Connect multiple sign-in methods to your account for easier access.
            You must have at least one sign-in method linked.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email/Password */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">Email & Password</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div>
              {hasPassword ? (
                <span className="text-sm text-green-600 font-medium">Connected</span>
              ) : (
                <span className="text-sm text-muted-foreground">Not available</span>
              )}
            </div>
          </div>

          <Separator />

          {/* Google */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">Google</p>
                <p className="text-sm text-muted-foreground">
                  Sign in with your Google account
                </p>
              </div>
            </div>
            <div>
              {hasGoogle ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnlinkProvider('google.com')}
                  disabled={loading !== null || linkedProviders.length <= 1}
                >
                  {loading === 'google.com' ? 'Unlinking...' : 'Unlink'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLinkProvider('google')}
                  disabled={loading !== null}
                >
                  {loading === 'google' ? 'Linking...' : 'Link Account'}
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Facebook */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Facebook</p>
                <p className="text-sm text-muted-foreground">
                  Sign in with your Facebook account
                </p>
              </div>
            </div>
            <div>
              {hasFacebook ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnlinkProvider('facebook.com')}
                  disabled={loading !== null || linkedProviders.length <= 1}
                >
                  {loading === 'facebook.com' ? 'Unlinking...' : 'Unlink'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLinkProvider('facebook')}
                  disabled={loading !== null}
                >
                  {loading === 'facebook' ? 'Linking...' : 'Link Account'}
                </Button>
              )}
            </div>
          </div>

          {linkedProviders.length <= 1 && (
            <p className="text-sm text-muted-foreground mt-4">
              ⚠️ You must have at least one sign-in method linked to your account.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
