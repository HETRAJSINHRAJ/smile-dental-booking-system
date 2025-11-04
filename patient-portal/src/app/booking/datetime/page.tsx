'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getService, getProvider, getAvailableTimeSlots } from '@/lib/firebase/firestore';
import type { Service, Provider } from '@/types/firebase';
import { Loader2, ArrowLeft, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrency } from '@/lib/localization/useCurrency';

function SelectDateTimeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const serviceId = searchParams.get('serviceId');
  const providerId = searchParams.get('providerId');
  const { user, loading: authLoading } = useAuth();
  const { formatCurrency } = useCurrency();

  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/booking');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!serviceId || !providerId) {
      router.push('/booking');
      return;
    }

    loadData();
  }, [serviceId, providerId]);

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

  useEffect(() => {
    if (selectedDate && service && providerId) {
      loadAvailableSlots();
    }
  }, [selectedDate, service, providerId]);

  async function loadAvailableSlots() {
    try {
      setLoadingSlots(true);
      const date = new Date(selectedDate);
      const slots = await getAvailableTimeSlots(providerId!, date, service!.duration);
      setAvailableSlots(slots);
      
      if (slots.length === 0) {
        toast.info("No available slots for this date. Please select another date.");
      }
    } catch (error) {
      console.error("Error loading slots:", error);
      toast.error("Failed to load available time slots");
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time');
      return;
    }

    router.push(
      `/booking/confirm?serviceId=${serviceId}&providerId=${providerId}&date=${selectedDate}&time=${selectedTime}`
    );
  };

  // Generate next 30 days for date selection (excluding Sundays)
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays (day 0)
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          fullDate: date
        });
      }
    }
    
    return dates;
  };

  const dates = generateDates();

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
            <CalendarIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Select Date & Time</h1>
          <p className="text-xl text-muted-foreground mb-4">
            Step 3 of 4: Choose when you'd like to come in
          </p>

          {/* Selected Info */}
          <div className="inline-flex flex-col sm:flex-row gap-4 bg-muted px-6 py-4 rounded-lg mb-8">
            <div>
              <p className="text-sm text-muted-foreground">Service:</p>
              <p className="font-semibold">{service?.name}</p>
              <p className="text-xs text-muted-foreground">{service?.duration} min • {formatCurrency(service?.price || 0)}</p>
            </div>
            <div className="hidden sm:block w-px bg-border" />
            <div>
              <p className="text-sm text-muted-foreground">Provider:</p>
              <p className="font-semibold">{provider?.name}, {provider?.title}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-12 h-2 bg-primary rounded-full" />
            <div className="w-12 h-2 bg-primary rounded-full" />
            <div className="w-12 h-2 bg-primary rounded-full" />
            <div className="w-12 h-2 bg-muted rounded-full" />
          </div>
        </div>

        {/* Date & Time Selection */}
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Date Selection */}
            <div className="bg-card rounded-xl shadow-lg p-6 border">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-primary" />
                Select Date
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
                {dates.map((date) => (
                  <button
                    key={date.value}
                    onClick={() => handleDateSelect(date.value)}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedDate === date.value
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`text-sm font-medium ${
                        selectedDate === date.value ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {date.fullDate.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className={`text-2xl font-bold ${
                        selectedDate === date.value ? 'text-primary' : 'text-foreground'
                      }`}>
                        {date.fullDate.getDate()}
                      </div>
                      <div className={`text-xs ${
                        selectedDate === date.value ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {date.fullDate.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className="bg-card rounded-xl shadow-lg p-6 border">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                Select Time
              </h3>

              {!selectedDate ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <CalendarIcon className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Please select a date first</p>
                </div>
              ) : loadingSlots ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Clock className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No available slots for this date</p>
                  <p className="text-sm text-muted-foreground mt-2">Please select another date</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => handleTimeSelect(slot)}
                      className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                        selectedTime === slot
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-md'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Continue Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleContinue}
              disabled={!selectedDate || !selectedTime}
              className="bg-primary text-primary-foreground px-12 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              Continue to Confirmation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Force dynamic rendering to prevent prerendering
export const dynamic = 'force-dynamic';

export default function SelectDateTimePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <SelectDateTimeContent />
    </Suspense>
  );
}