'use client';

import { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { FaFacebook } from 'react-icons/fa';

interface SocialLoginButtonsProps {
  onGoogleSuccess: (credentialResponse: CredentialResponse) => Promise<void>;
  onFacebookClick: () => Promise<void>;
  disabled?: boolean;
}

export function SocialLoginButtons({
  onGoogleSuccess,
  onFacebookClick,
  disabled = false,
}: SocialLoginButtonsProps) {
  const [facebookLoading, setFacebookLoading] = useState(false);

  const handleFacebookClick = async () => {
    setFacebookLoading(true);
    try {
      await onFacebookClick();
    } finally {
      setFacebookLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Google Sign-In */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={() => {
            console.error('Google Login Failed');
          }}
          useOneTap={false}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          width="100%"
        />
      </div>

      {/* Facebook Login */}
      <Button
        type="button"
        variant="outline"
        className="w-full py-6 text-base border-2 hover:bg-blue-50 dark:hover:bg-blue-950"
        onClick={handleFacebookClick}
        disabled={disabled || facebookLoading}
      >
        {facebookLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Connecting...
          </>
        ) : (
          <>
            <FaFacebook className="w-5 h-5 mr-2 text-blue-600" />
            Continue with Facebook
          </>
        )}
      </Button>
    </div>
  );
}
