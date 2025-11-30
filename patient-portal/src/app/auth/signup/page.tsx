'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PhoneInput } from '@/components/ui/phone-input';
import { Checkbox } from '@/components/ui/checkbox';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { CredentialResponse } from '@react-oauth/google';

export default function SignupPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithFacebook } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToPrivacyPolicy, setAgreedToPrivacyPolicy] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Validate consent checkboxes
    if (!agreedToPrivacyPolicy) {
      setError('You must agree to the Privacy Policy to create an account');
      return;
    }

    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service to create an account');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, name, phone, 'patient', {
        privacyPolicy: agreedToPrivacyPolicy,
        termsOfService: agreedToTerms,
      });
      router.push("/");
    } catch (err: any) {
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      console.error('No credential received from Google');
      return;
    }

    setLoading(true);
    try {
      await signInWithGoogle(credentialResponse.credential);
      router.push("/");
    } catch (err: any) {
      console.error('Google signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookClick = async () => {
    setLoading(true);
    try {
      await signInWithFacebook();
      router.push("/");
    } catch (err: any) {
      console.error('Facebook signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-blue-50 dark:from-background dark:via-background dark:to-muted flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🦷</div>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground">Start booking your dental appointments</p>
        </div>

        {/* Form Card */}
        <Card className="p-8 border-2">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="mb-6">
            <SocialLoginButtons
              onGoogleSuccess={handleGoogleSuccess}
              onFacebookClick={handleFacebookClick}
              disabled={loading}
            />
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or sign up with email</span>
            </div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background"
                placeholder="john@example.com"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                showValidation={true}
                showTelecomCircle={false}
                showSMSIndicator={false}
                placeholder="+91 12345 67890"
                className="bg-background"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 bg-background"
                  placeholder="••••••••"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Must be at least 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 bg-background"
                  placeholder="••••••••"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Consent Checkboxes */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacyPolicy"
                  checked={agreedToPrivacyPolicy}
                  onCheckedChange={(checked) => setAgreedToPrivacyPolicy(checked === true)}
                  required
                  className="mt-1"
                />
                <label
                  htmlFor="privacyPolicy"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  I agree to the{' '}
                  <Link
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Privacy Policy
                  </Link>
                  <span className="text-destructive ml-1">*</span>
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="termsOfService"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  required
                  className="mt-1"
                />
                <label
                  htmlFor="termsOfService"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  I agree to the{' '}
                  <Link
                    href="/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms of Service
                  </Link>
                  <span className="text-destructive ml-1">*</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-base"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}