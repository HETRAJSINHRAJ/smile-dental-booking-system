'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import Link from 'next/link';
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      let errorMessage = 'Failed to send password reset email';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h1>
            <p className="text-gray-600">
              We've sent a password reset link to
            </p>
            <p className="text-blue-600 font-semibold mt-1">{email}</p>
          </div>

          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-4 text-center">
              <p className="text-gray-700">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Didn't receive the email?</strong>
                  <br />
                  Check your spam folder or{' '}
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setEmail('');
                    }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    try again
                  </button>
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-gray-600">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
