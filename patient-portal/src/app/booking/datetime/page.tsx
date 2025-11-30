"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  getService,
  getProvider,
  getAvailableTimeSlots,
} from "@/lib/firebase/firestore";
import type { Service, Provider } from "@/types/shared";
import {
  Loader2,
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/lib/localization/useCurrency";
import { analyticsService } from "@/lib/analytics/analyticsService";
import { JoinWaitlistDialog } from "@/components/waitlist/JoinWaitlistDialog";

function SelectDateTimeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const serviceId = searchParams.get("serviceId");
  const providerId = searchParams.get("providerId");
  const { user, loading: authLoading } = useAuth();
  const { formatCurrency } = useCurrency();

  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [allTimeSlots, setAllTimeSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);
  const [waitlistSlot, setWaitlistSlot] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/booking");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!serviceId || !providerId) {
      router.push("/booking");
      return;
    }

    loadData();
  }, [serviceId, providerId]);

  async function loadData() {
    try {
      setLoading(true);

      const [serviceData, providerData] = await Promise.all([
        getService(serviceId!),
        getProvider(providerId!),
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

  // Generate all possible time slots for the day
  const generateAllTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        slots.push(timeSlot);
      }
    }

    return slots;
  };

  // Convert 24-hour time to 12-hour format with AM/PM
  const formatTimeTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  async function loadAvailableSlots() {
    try {
      setLoadingSlots(true);
      const date = new Date(selectedDate);
      const slots = await getAvailableTimeSlots(
        providerId!,
        date,
        service!.duration,
      );
      setAvailableSlots(slots);

      // Generate all possible time slots
      const allSlots = generateAllTimeSlots();
      setAllTimeSlots(allSlots);

      if (slots.length === 0) {
        toast.info(
          "No available slots for this date. Please select another date.",
        );
      }
    } catch (error) {
      console.error("Error loading slots:", error);
      toast.error("Failed to load available time slots");
      setAvailableSlots([]);
      setAllTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handleTimeSelect = (time: string, isAvailable: boolean) => {
    if (isAvailable) {
      setSelectedTime(time);
    } else {
      // Show waitlist dialog for unavailable slots
      setWaitlistSlot(time);
      setShowWaitlistDialog(true);
    }
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both date and time");
      return;
    }

    // Track booking date selected event
    analyticsService.trackBookingDateSelected(serviceId!, providerId!, selectedDate);

    router.push(
      `/booking/confirm?serviceId=${serviceId}&providerId=${providerId}&date=${selectedDate}&time=${selectedTime}`,
    );
  };

  // Generate next 30 days for date selection (excluding today and Sundays)
  const generateDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i < 31; i++) { // Start from tomorrow (i = 1)
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Skip Sundays (day 0)
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split("T")[0],
          label: date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
          fullDate: date,
        });
      }
    }

    return dates;
  };

  const dates = generateDates();

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Select Date & Time</h1>
              <p className="text-sm text-muted-foreground">
                Choose your preferred appointment slot
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  ✓
                </div>
                <span className="text-sm font-medium">Service</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  ✓
                </div>
                <span className="text-sm font-medium">Provider</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  3
                </div>
                <span className="text-sm font-medium">Date & Time</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
                  4
                </div>
                <span className="text-sm text-muted-foreground">Confirm</span>
              </div>
            </div>
          </div>

          {/* Selection Summary */}
          <div className="bg-muted/50 rounded-lg p-4 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <p className="text-xs text-muted-foreground mb-1">Service</p>
              <p className="font-medium text-sm">{service?.name}</p>
              <p className="text-xs text-muted-foreground">
                {service?.duration} min • {formatCurrency(service?.price || 0)}
              </p>
            </div>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div className="flex-1 min-w-[200px]">
              <p className="text-xs text-muted-foreground mb-1">Provider</p>
              <p className="font-medium text-sm">{provider?.name}</p>
              <p className="text-xs text-muted-foreground">{provider?.title}</p>
            </div>
            {selectedDate && selectedTime && (
              <>
                <div className="h-8 w-px bg-border hidden sm:block" />
                <div className="flex-1 min-w-[200px]">
                  <p className="text-xs text-muted-foreground mb-1">Selected</p>
                  <p className="font-medium text-sm">
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    at {formatTimeTo12Hour(selectedTime)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Date Selection */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Select Date</h2>
            </div>

            <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2">
              {dates.map((date) => (
                <button
                  key={date.value}
                  onClick={() => handleDateSelect(date.value)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedDate === date.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <div className="text-center">
                    <div
                      className={`text-xs font-medium mb-1 ${
                        selectedDate === date.value
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {date.fullDate.toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </div>
                    <div
                      className={`text-xl font-bold ${
                        selectedDate === date.value
                          ? "text-primary"
                          : "text-foreground"
                      }`}
                    >
                      {date.fullDate.getDate()}
                    </div>
                    <div
                      className={`text-xs ${
                        selectedDate === date.value
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {date.fullDate.toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Select Time</h2>
            </div>

            {!selectedDate ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
                  <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Please select a date first
                </p>
              </div>
            ) : loadingSlots ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : allTimeSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  No slots available
                </p>
                <p className="text-xs text-muted-foreground">
                  Please select another date
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded border-2 border-primary bg-primary/10"></div>
                    <span className="text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded border-2 border-muted-foreground/30 bg-muted/50"></div>
                    <span className="text-muted-foreground">Booked</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 max-h-[350px] overflow-y-auto pr-2">
                  {allTimeSlots.map((slot) => {
                    const isAvailable = availableSlots.includes(slot);
                    const isSelected = selectedTime === slot;

                    return (
                      <button
                        key={slot}
                        onClick={() => handleTimeSelect(slot, isAvailable)}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : isAvailable
                              ? "border-border hover:border-primary/50 hover:bg-muted/50"
                              : "border-muted-foreground/30 bg-muted/50 text-muted-foreground hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 cursor-pointer"
                        }`}
                        title={!isAvailable ? "Click to join waitlist" : ""}
                      >
                        {formatTimeTo12Hour(slot)}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg font-medium border-2 border-border hover:bg-muted/50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedDate || !selectedTime}
            className="px-8 py-3 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>

      {/* Waitlist Dialog */}
      {showWaitlistDialog && service && provider && selectedDate && waitlistSlot && (
        <JoinWaitlistDialog
          isOpen={showWaitlistDialog}
          onClose={() => {
            setShowWaitlistDialog(false);
            setWaitlistSlot("");
          }}
          service={service}
          provider={provider}
          selectedDate={new Date(selectedDate)}
          selectedTime={waitlistSlot}
          onSuccess={() => {
            toast.success("Successfully joined waitlist!");
          }}
        />
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";

export default function SelectDateTimePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      }
    >
      <SelectDateTimeContent />
    </Suspense>
  );
}
