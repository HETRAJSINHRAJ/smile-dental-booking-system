"use client";

import React, { memo, useMemo } from "react";
import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Appointment } from "@/types/shared";
import { format } from "date-fns";

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: (appointment: Appointment) => void;
  showDetails?: boolean;
}

/**
 * Memoized appointment card component for optimized list rendering
 */
export const AppointmentCard = memo(function AppointmentCard({
  appointment,
  onClick,
  showDetails = false,
}: AppointmentCardProps) {
  // Memoize status color calculation
  const statusColor = useMemo(() => {
    switch (appointment.status) {
      case "confirmed":
        return "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300";
      case "cancelled":
        return "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300";
      case "completed":
        return "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300";
      case "no_show":
        return "bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300";
    }
  }, [appointment.status]);

  // Memoize formatted date
  const formattedDate = useMemo(() => {
    try {
      return format(appointment.appointmentDate.toDate(), "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  }, [appointment.appointmentDate]);

  const handleClick = () => {
    if (onClick) {
      onClick(appointment);
    }
  };

  return (
    <Card
      className={`p-4 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{appointment.userName}</p>
          <p className="text-xs text-muted-foreground">
            {appointment.serviceName} • {appointment.startTime}
          </p>
          {showDetails && (
            <p className="text-xs text-muted-foreground mt-1">
              {formattedDate} • {appointment.providerName}
            </p>
          )}
        </div>
        <Badge className={statusColor} variant="secondary">
          {appointment.status}
        </Badge>
      </div>
    </Card>
  );
});

// Display name for debugging
AppointmentCard.displayName = "AppointmentCard";
