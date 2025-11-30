'use client';

import { useState } from 'react';
import { Calendar, Clock, AlertCircle, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Appointment, RescheduleHistoryEntry } from '@/types';
import { format } from 'date-fns';
import { trackAppointmentRescheduled } from '@/lib/analytics/googleAnalytics';
import { useAuth } from '@/contexts/AuthContext';

interface RescheduleDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RescheduleDialog({
  appointment,
  open,
  onOpenChange,
  onSuccess,
}: RescheduleDialogProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Check reschedule limits
  const rescheduleCount = appointment.rescheduleCount || 0;
  const maxReschedules = appointment.maxReschedules || 2;
  const canReschedule = rescheduleCount < maxReschedules;
  const remainingReschedules = maxReschedules - rescheduleCount;

  // Generate time slots (9 AM to 5 PM, 30-minute intervals)
  const timeSlots = [];
  for (let hour = 9; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(time);
    }
  }

  const handleReschedule = async () => {
    if (!canReschedule) {
      toast.error('You have reached the maximum number of reschedules for this appointment');
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to reschedule');
      return;
    }

    setIsRescheduling(true);

    try {
      const appointmentRef = doc(db, 'appointments', appointment.id);
      
      // Calculate end time (assuming same duration)
      const [startHour, startMinute] = selectedTime.split(':').map(Number);
      const duration = appointment.serviceDuration || 60;
      const endHour = startHour + Math.floor((startMinute + duration) / 60);
      const endMinute = (startMinute + duration) % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

      // Create reschedule history entry
      const historyEntry: RescheduleHistoryEntry = {
        from: {
          date: appointment.appointmentDate,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
        },
        to: {
          date: Timestamp.fromDate(selectedDate) as any,
          startTime: selectedTime,
          endTime: endTime,
        },
        reason: reason || undefined,
        rescheduledBy: user.uid,
        rescheduledByRole: 'patient',
        rescheduledAt: Timestamp.now() as any,
      };

      // Update appointment with new date/time and reschedule tracking
      const rescheduleHistory = appointment.rescheduleHistory || [];
      await updateDoc(appointmentRef, {
        appointmentDate: Timestamp.fromDate(selectedDate),
        startTime: selectedTime,
        endTime: endTime,
        status: 'confirmed', // Keep as confirmed
        rescheduleCount: rescheduleCount + 1,
        rescheduleHistory: [...rescheduleHistory, historyEntry],
        updatedAt: Timestamp.now(),
      });

      // Call API to send reschedule notifications
      try {
        await fetch('/api/notifications/reschedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId: appointment.id,
            oldDate: format(appointment.appointmentDate.toDate(), 'MMMM d, yyyy'),
            oldTime: appointment.startTime,
            newDate: format(selectedDate, 'MMMM d, yyyy'),
            newTime: selectedTime,
            rescheduledBy: 'patient',
          }),
        });
      } catch (notifError) {
        console.error('Failed to send reschedule notifications:', notifError);
        // Don't fail the reschedule if notification fails
      }

      toast.success('Appointment rescheduled successfully!');
      trackAppointmentRescheduled(appointment.id);
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast.error('Failed to reschedule appointment');
    } finally {
      setIsRescheduling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Select a new date and time for your appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Reschedule Limit Warning */}
          {!canReschedule ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have reached the maximum number of reschedules ({maxReschedules}) for this appointment.
                Please contact us if you need to make changes.
              </AlertDescription>
            </Alert>
          ) : remainingReschedules <= 1 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have {remainingReschedules} reschedule{remainingReschedules !== 1 ? 's' : ''} remaining for this appointment.
              </AlertDescription>
            </Alert>
          )}

          {/* Current Appointment Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Current Appointment</h4>
            <p className="text-sm text-gray-600">
              {appointment.serviceName} with {appointment.providerName}
            </p>
            <p className="text-sm text-gray-600">
              {format(appointment.appointmentDate.toDate(), 'MMMM d, yyyy')} at{' '}
              {appointment.startTime}
            </p>
          </div>

          {/* Reschedule History */}
          {appointment.rescheduleHistory && appointment.rescheduleHistory.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <History className="w-4 h-4" />
                Reschedule History
              </h4>
              <div className="space-y-2">
                {appointment.rescheduleHistory.map((entry, index) => (
                  <div key={index} className="text-sm text-gray-600 border-l-2 border-blue-300 pl-3">
                    <p>
                      Changed from {format(entry.from.date.toDate(), 'MMM d, yyyy')} at {entry.from.startTime}
                      {' → '}
                      {format(entry.to.date.toDate(), 'MMM d, yyyy')} at {entry.to.startTime}
                    </p>
                    <p className="text-xs text-gray-500">
                      By {entry.rescheduledByRole} on {format(entry.rescheduledAt.toDate(), 'MMM d, yyyy')}
                    </p>
                    {entry.reason && (
                      <p className="text-xs text-gray-500 italic">Reason: {entry.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {canReschedule && (
            <>
              {/* Date Selection */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  Select New Date
                </Label>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md border"
                />
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4" />
                    Select New Time
                  </Label>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reason (Optional) */}
              {selectedDate && selectedTime && (
                <div>
                  <Label htmlFor="reason">Reason for Rescheduling (Optional)</Label>
                  <Textarea
                    id="reason"
                    placeholder="Let us know why you need to reschedule..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {canReschedule && (
              <Button
                onClick={handleReschedule}
                disabled={!selectedDate || !selectedTime || isRescheduling}
              >
                {isRescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
