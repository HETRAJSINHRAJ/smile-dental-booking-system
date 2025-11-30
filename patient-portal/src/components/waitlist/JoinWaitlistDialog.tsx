"use client";

import { useState } from "react";
import { X, Clock, Calendar, User, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { joinWaitlist, isUserOnWaitlist } from "@/lib/waitlist/waitlistService";
import { useAuth } from "@/contexts/AuthContext";
import type { Service, Provider } from "@/types/shared";

interface JoinWaitlistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  provider: Provider;
  selectedDate: Date;
  selectedTime: string;
  onSuccess?: () => void;
}

export function JoinWaitlistDialog({
  isOpen,
  onClose,
  service,
  provider,
  selectedDate,
  selectedTime,
  onSuccess,
}: JoinWaitlistDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const formatTimeTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const handleJoinWaitlist = async () => {
    if (!user) {
      toast.error("Please log in to join the waitlist");
      return;
    }

    try {
      setLoading(true);

      // Check if user is already on waitlist
      const alreadyOnWaitlist = await isUserOnWaitlist(
        user.uid,
        provider.id,
        service.id,
        selectedDate
      );

      if (alreadyOnWaitlist) {
        toast.info("You're already on the waitlist for this date");
        onClose();
        return;
      }

      // Join waitlist
      await joinWaitlist({
        userId: user.uid,
        userName: user.displayName || user.email || "Unknown",
        userEmail: user.email || "",
        userPhone: user.phoneNumber || undefined,
        providerId: provider.id,
        providerName: provider.name,
        serviceId: service.id,
        serviceName: service.name,
        preferredDate: selectedDate,
        preferredTime: selectedTime,
      });

      toast.success(
        "Successfully joined waitlist! We'll notify you when a slot opens up."
      );
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error joining waitlist:", error);
      toast.error("Failed to join waitlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Join Waitlist</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            This time slot is currently unavailable. Join the waitlist and we'll
            notify you if a slot opens up.
          </p>

          {/* Appointment Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Service</p>
                <p className="font-medium">{service.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Provider</p>
                <p className="font-medium">{provider.name}</p>
                <p className="text-xs text-muted-foreground">{provider.title}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Preferred Date</p>
                <p className="font-medium">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Preferred Time</p>
                <p className="font-medium">{formatTimeTo12Hour(selectedTime)}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>What happens next?</strong>
              <br />
              If a slot becomes available, we'll notify you via email and push
              notification. You'll have 24 hours to book the appointment before we
              notify the next person on the waitlist.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg font-medium border-2 border-border hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleJoinWaitlist}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Joining..." : "Join Waitlist"}
          </button>
        </div>
      </div>
    </div>
  );
}
