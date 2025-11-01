'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAppointment } from '@/lib/firebase/firestore';
import type { Appointment } from '@/types/firebase';
import { CheckCircle, Calendar, Mail, Phone, Home, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

function BookingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appointmentId) {
      router.push('/booking');
      return;
    }

    loadAppointment();
  }, [appointmentId]);

  async function loadAppointment() {
    try {
      const data = await getAppointment(appointmentId!);
      if (!data) {
        toast.error("Appointment not found");
        router.push('/booking');
        return;
      }
      setAppointment(data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error("Failed to load appointment details");
    } finally {
      setLoading(false);
    }
  }

  const handleAddToCalendar = () => {
    if (!appointment) return;

    const appointmentDate = appointment.appointmentDate.toDate();
    const startDateTime = new Date(
      `${appointmentDate.toISOString().split('T')[0]}T${appointment.startTime}`
    );
    const endDateTime = new Date(
      `${appointmentDate.toISOString().split('T')[0]}T${appointment.endTime}`
    );

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatICSDate(startDateTime)}
DTEND:${formatICSDate(endDateTime)}
SUMMARY:Dental Appointment - ${appointment.serviceName}
DESCRIPTION:Appointment with ${appointment.providerName} at Smile Dental Practice
LOCATION:Smile Dental Practice
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dental-appointment.ics';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Calendar event downloaded!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Appointment Not Found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find your appointment details.</p>
          <Link
            href="/booking"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90"
          >
            Book New Appointment
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = appointment.appointmentDate.toDate().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const confirmationNumber = appointmentId!.substring(0, 8).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 py-12">
      <div className="container mx-auto px-4">
        {/* Success Animation */}
        <div className="max-w-3xl mx-auto text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Appointment Confirmed! 🎉
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            We're looking forward to seeing you!
          </p>
          <div className="inline-block bg-card px-6 py-3 rounded-lg shadow-md border">
            <p className="text-sm text-muted-foreground mb-1">Confirmation Number</p>
            <p className="text-2xl font-mono font-bold text-primary">{confirmationNumber}</p>
          </div>
        </div>

        {/* Appointment Details Card */}
        <div className="max-w-3xl mx-auto bg-card rounded-2xl shadow-2xl overflow-hidden mb-8 border">
          <div className="bg-primary text-primary-foreground p-8 text-center">
            <h2 className="text-3xl font-bold mb-2">Your Appointment Details</h2>
            <p className="opacity-90">Please save this information</p>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Service */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🦷</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Service</p>
                  <p className="text-lg font-semibold">{appointment.serviceName}</p>
                </div>
              </div>

              {/* Provider */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">👨‍⚕️</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Provider</p>
                  <p className="text-lg font-semibold">{appointment.providerName}</p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date</p>
                  <p className="text-lg font-semibold">{formattedDate}</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⏰</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Time</p>
                  <p className="text-lg font-semibold">
                    {appointment.startTime} - {appointment.endTime}
                  </p>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-primary/10 border-l-4 border-primary p-6 mb-6">
              <h3 className="font-semibold mb-3">Important Information</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>A confirmation email has been sent to {appointment.userEmail}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Please arrive 10 minutes early to complete any necessary paperwork</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Bring your insurance card and a valid ID</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>We'll send you a reminder 24 hours before your appointment</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={handleAddToCalendar}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                Add to Calendar
              </button>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 border-2 border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary/10 transition-colors"
              >
                View My Appointments
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="max-w-3xl mx-auto bg-card rounded-xl shadow-lg p-8 mb-8 border">
          <h3 className="text-2xl font-bold mb-6 text-center">
            Need to Make Changes?
          </h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold mb-1">Call Us</p>
              <a href="tel:+15551234567" className="text-primary hover:underline">
                (555) 123-4567
              </a>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold mb-1">Email Us</p>
              <a href="mailto:info@smiledental.com" className="text-primary hover:underline">
                info@smiledental.com
              </a>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            To cancel or reschedule, please contact us at least 24 hours in advance
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-muted px-8 py-3 rounded-lg font-semibold hover:bg-muted/80 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <Link
            href="/booking"
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Book Another Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}

// Force dynamic rendering to prevent prerendering
export const dynamic = 'force-dynamic';

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}