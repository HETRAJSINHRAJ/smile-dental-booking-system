"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';
import { isEmailWhitelisted } from '@/lib/adminWhitelist';
import { toast } from 'sonner';

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [whitelistChecked, setWhitelistChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!loading && user) {
        // Check if user email is whitelisted
        const whitelisted = await isEmailWhitelisted(user.email || '');

        if (!whitelisted) {
          console.warn('User email not in whitelist:', user.email);
          toast.error('Access Denied', {
            description: 'Your email is not authorized for admin access.',
          });
          router.push('/auth/login?error=not_whitelisted');
          setIsAuthorized(false);
          setWhitelistChecked(true);
          return;
        }

        // User is authenticated and whitelisted - grant access
        console.log('✅ Admin access granted for:', user.email);
        setIsAuthorized(true);
        setWhitelistChecked(true);
      } else if (!loading && !user) {
        // Not authenticated - redirect to login
        router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
        setWhitelistChecked(true);
      }
    };

    checkAuthorization();
  }, [user, loading, router]);

  // Show loading state while checking auth and whitelist
  if (loading || !whitelistChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized state
  if (!user || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <div className="text-center max-w-md p-8">
          <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You do not have permission to access the admin portal.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
