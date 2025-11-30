"use client";

import { useState, useEffect } from "react";
import { Clock, Loader2 } from "lucide-react";
import { getUserWaitlistEntries } from "@/lib/waitlist/waitlistService";
import { WaitlistCard } from "@/components/waitlist/WaitlistCard";
import type { Waitlist } from "@/types/shared";

interface WaitlistSectionProps {
  userId: string;
}

export function WaitlistSection({ userId }: WaitlistSectionProps) {
  const [waitlistEntries, setWaitlistEntries] = useState<Waitlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWaitlistEntries();
  }, [userId]);

  const loadWaitlistEntries = async () => {
    try {
      setLoading(true);
      const entries = await getUserWaitlistEntries(userId);
      setWaitlistEntries(entries);
    } catch (error) {
      console.error("Error loading waitlist entries:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (waitlistEntries.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No active waitlist entries
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {waitlistEntries.map((entry) => (
        <WaitlistCard key={entry.id} entry={entry} onUpdate={loadWaitlistEntries} />
      ))}
    </div>
  );
}
