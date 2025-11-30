"use client";

import { useState } from "react";
import { Calendar, Clock, User, Briefcase, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cancelWaitlistEntry, deleteWaitlistEntry } from "@/lib/waitlist/waitlistService";
import type { Waitlist } from "@/types/shared";

interface WaitlistCardProps {
  entry: Waitlist;
  onUpdate: () => void;
}

export function WaitlistCard({ entry, onUpdate }: WaitlistCardProps) {
  const [loading, setLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const formatTimeTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Active
          </span>
        );
      case "notified":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
            Notified
          </span>
        );
      case "expired":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            Expired
          </span>
        );
      case "booked":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
            Booked
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      await cancelWaitlistEntry(entry.id);
      toast.success("Waitlist entry cancelled");
      onUpdate();
      setShowCancelDialog(false);
    } catch (error) {
      console.error("Error cancelling waitlist entry:", error);
      toast.error("Failed to cancel waitlist entry");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteWaitlistEntry(entry.id);
      toast.success("Waitlist entry deleted");
      onUpdate();
    } catch (error) {
      console.error("Error deleting waitlist entry:", error);
      toast.error("Failed to delete waitlist entry");
    } finally {
      setLoading(false);
    }
  };

  const preferredDate = entry.preferredDate.toDate();
  const isExpired = entry.status === "expired" || entry.status === "cancelled";

  return (
    <>
      <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(entry.status)}
              {entry.notifiedAt && (
                <span className="text-xs text-muted-foreground">
                  Notified{" "}
                  {entry.notifiedAt.toDate().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
          {entry.status === "active" && (
            <button
              onClick={() => setShowCancelDialog(true)}
              disabled={loading}
              className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
              title="Cancel waitlist entry"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {isExpired && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
              title="Delete waitlist entry"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">{entry.serviceName}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">{entry.providerName}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                {preferredDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                {formatTimeTo12Hour(entry.preferredTime)}
              </p>
            </div>
          </div>
        </div>

        {entry.status === "notified" && entry.expiresAt && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-amber-600 dark:text-amber-400">
              ⏰ Expires on{" "}
              {entry.expiresAt.toDate().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}

        {entry.cancellationReason && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Reason: {entry.cancellationReason}
            </p>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card border rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">Cancel Waitlist Entry?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to cancel this waitlist entry? You won't be
                notified if a slot becomes available.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelDialog(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg font-medium border-2 border-border hover:bg-muted/50 transition-colors disabled:opacity-50"
                >
                  Keep Entry
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  {loading ? "Cancelling..." : "Cancel Entry"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
