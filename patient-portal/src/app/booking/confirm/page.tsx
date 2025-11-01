'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getService, getProvider, createAppointment } from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import type { Service, Provider } from '@/types/firebase';
import { Loader2, ArrowLeft, Calendar, Clock, User, DollarSign, FileText } from 'lucide-react';
import { toast } from 'sonner';

function ConfirmBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const serviceId = searchParams.get('serviceId');
  const providerId = searchParams.get('providerId');
  const date = searchParams.get('date');
  const time = searchParams.get('time');

  const { user, loading: authLoading } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/booking');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!serviceId || !providerId || !date || !time) {
      router.push('/booking');
      return;
    }

    loadData();
  }, [serviceId, providerId, date, time]);

  async function loadData() {
    try {
      setLoading(true);
      
      const [serviceData, providerData] = await Promise.all([
        getService(serviceId!),
        getProvider(providerId!)
      ]);

      if (!serviceData || !providerData) {
        toast.error("Service or provider not found");
        router.push("/booking");
        return;
      }

      setService(serviceData);
      setProvider(providerData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  }

  const handleConfirm = async () => {
    if (!agreeToPolicy) {
      toast.error('Please agree to the cancellation policy');
      return;
    }

    if (!user || !service || !provider) {
      toast.error('Missing required information');
      return;
    }

    setSubmitting(true);

    try {
      // Calculate end time
      const [hours, minutes] = time!.split(':').map(Number);
      const durationNum = service.duration;
      const endMinutes = (hours * 60 + minutes + durationNum);
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

      // Convert date string to timestamp
      const appointmentDate = new Date(date! + 'T' + time + ':00');

      // Create appointment
      const appointmentId = await createAppointment({
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || '',
        userPhone: user.phoneNumber || '',
        serviceId: service.id,
        serviceName: service.name,
        providerId: provider.id,
        providerName: provider.name,
        appointmentDate: Timestamp.fromDate(appointmentDate),
        startTime: time!,
        endTime,
        status: 'pending',
        notes
      });

      toast.success('Appointment confirmed successfully!');
      router.push(`/booking/success?appointmentId=${appointmentId}`);
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const formattedDate = date ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Confirm Your Appointment</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Step 4 of 4: Review and confirm your booking
          </p>

          {/* Progress Bar */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-12 h-2 bg-primary rounded-full" />
            <div className="w-12 h-2 bg-primary rounded-full" />
            <div className="w-12 h-2 bg-primary rounded-full" />
            <div className="w-12 h-2 bg-primary rounded-full" />
          </div>
        </div>

        {/* Confirmation Details */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-xl shadow-lg overflow-hidden mb-6 border">
            <div className="bg-primary text-primary-foreground p-6">
              <h2 className="text-2xl font-bold">Appointment Details</h2>
            </div>

            <div className="p-8 space-y-6">
              {/* Service */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🦷</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Service</p>
                  <p className="text-lg font-semibold">{service?.name}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {service?.duration} minutes
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ${service?.price}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t" />

              {/* Provider */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Provider</p>
                  <p className="text-lg font-semibold">{provider?.name}, {provider?.title}</p>
                </div>
              </div>

              <div className="border-t" />

              {/* Date & Time */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                  <p className="text-lg font-semibold">{formattedDate}</p>
                  <p className="text-muted-foreground mt-1">{time}</p>
                </div>
              </div>

              <div className="border-t" />

              {/* Patient Info */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">Your Information</p>
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <p><strong>Name:</strong> {user?.displayName || 'Not provided'}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Phone:</strong> {user?.phoneNumber || 'Not provided'}</p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-background"
                  placeholder="Any specific concerns or requests?"
                />
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-6">
            <h3 className="font-semibold mb-3">Cancellation Policy</h3>
            <ul className="space-y-2 text-sm mb-4">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                <span>Please arrive 10 minutes early to complete any necessary paperwork</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                <span>Cancellations must be made at least 24 hours in advance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                <span>Late cancellations or no-shows may incur a fee</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                <span>You will receive a confirmation email and reminder before your appointment</span>
              </li>
            </ul>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeToPolicy"
                checked={agreeToPolicy}
                onChange={(e) => setAgreeToPolicy(e.target.checked)}
                className="mt-1 mr-3 h-4 w-4 text-primary border-border rounded focus:ring-primary"
              />
              <label htmlFor="agreeToPolicy" className="text-sm">
                I understand and agree to the cancellation policy
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 border-2 border-border px-8 py-4 rounded-lg font-semibold hover:bg-muted transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={!agreeToPolicy || submitting}
              className="flex-1 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm Appointment'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Force dynamic rendering to prevent prerendering
export const dynamic = 'force-dynamic';

export default function ConfirmBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <ConfirmBookingContent />
    </Suspense>
  );
}