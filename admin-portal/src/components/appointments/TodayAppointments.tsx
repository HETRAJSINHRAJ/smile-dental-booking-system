"use client";

import { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar,
  Bell,
  BellRing,
  Timer,
  MapPin,
  Stethoscope
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllDocuments, updateAppointment } from '@/lib/firebase/firestore';
import type { Appointment } from '@/types/firebase';
import { toast } from 'sonner';
import { Timestamp } from 'firebase/firestore';

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

interface TodayAppointment extends Appointment {
  timeStatus: 'upcoming' | 'current' | 'overdue' | 'completed';
  minutesUntil: number;
  isOverdue: boolean;
}

const statusColors: Record<AppointmentStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-600 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
  no_show: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

const timeStatusColors = {
  upcoming: 'bg-blue-50 border-blue-200',
  current: 'bg-green-50 border-green-200',
  overdue: 'bg-red-50 border-red-200',
  completed: 'bg-gray-50 border-gray-200',
};

export default function TodayAppointments() {
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchTodayAppointments();
    
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Recalculate time status when current time updates
    if (todayAppointments.length > 0) {
      const updated = todayAppointments.map(apt => calculateTimeStatus(apt));
      setTodayAppointments(updated);
    }
  }, [currentTime]);

  const fetchTodayAppointments = async () => {
    try {
      setLoading(true);
      const allAppointments = await getAllDocuments<Appointment>('appointments');
      
      // Filter for today's appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayApts = allAppointments.filter(apt => {
        const aptDate = apt.appointmentDate instanceof Timestamp 
          ? apt.appointmentDate.toDate() 
          : new Date(apt.appointmentDate);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime();
      });

      // Calculate time status for each appointment
      const appointmentsWithTimeStatus = todayApts.map(apt => calculateTimeStatus(apt));
      
      // Sort by appointment time
      appointmentsWithTimeStatus.sort((a, b) => {
        const timeA = a.startTime || '00:00';
        const timeB = b.startTime || '00:00';
        return timeA.localeCompare(timeB);
      });

      setTodayAppointments(appointmentsWithTimeStatus);
    } catch (error) {
      console.error('Error fetching today\'s appointments:', error);
      toast.error('Failed to load today\'s appointments');
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeStatus = (appointment: Appointment): TodayAppointment => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!appointment.startTime) {
      return {
        ...appointment,
        timeStatus: 'upcoming',
        minutesUntil: 0,
        isOverdue: false,
      };
    }

    // Parse appointment time
    const [hours, minutes] = appointment.startTime.split(':').map(Number);
    const appointmentTime = new Date(today);
    appointmentTime.setHours(hours, minutes, 0, 0);

    // Calculate minutes until appointment
    const minutesUntil = Math.floor((appointmentTime.getTime() - now.getTime()) / (1000 * 60));

    let timeStatus: 'upcoming' | 'current' | 'overdue' | 'completed' = 'upcoming';
    let isOverdue = false;

    if (appointment.status === 'completed' || appointment.status === 'cancelled' || appointment.status === 'no_show') {
      timeStatus = 'completed';
    } else if (minutesUntil <= -30) { // 30 minutes past appointment time
      timeStatus = 'overdue';
      isOverdue = true;
    } else if (minutesUntil <= 15 && minutesUntil >= -15) { // 15 minutes before to 15 minutes after
      timeStatus = 'current';
    } else {
      timeStatus = 'upcoming';
    }

    return {
      ...appointment,
      timeStatus,
      minutesUntil,
      isOverdue,
    };
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      await updateAppointment(appointmentId, { status: newStatus });
      
      // Update local state
      setTodayAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId 
            ? calculateTimeStatus({ ...apt, status: newStatus })
            : apt
        )
      );

      toast.success(`Appointment marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const formatTime = (time: string | undefined) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTimeStatusText = (appointment: TodayAppointment) => {
    if (appointment.timeStatus === 'completed') return '';
    
    if (appointment.timeStatus === 'current') {
      return 'Now';
    } else if (appointment.timeStatus === 'overdue') {
      return `${Math.abs(appointment.minutesUntil)} min overdue`;
    } else if (appointment.minutesUntil <= 60) {
      return `in ${appointment.minutesUntil} min`;
    } else {
      const hours = Math.floor(appointment.minutesUntil / 60);
      const mins = appointment.minutesUntil % 60;
      return `in ${hours}h ${mins}m`;
    }
  };

  const getTimeStatusIcon = (appointment: TodayAppointment) => {
    switch (appointment.timeStatus) {
      case 'current':
        return <BellRing className="h-4 w-4 text-green-600" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'upcoming':
        return <Timer className="h-4 w-4 text-blue-600" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-gray-600" />;
    }
  };

  const overdueCount = todayAppointments.filter(apt => apt.isOverdue).length;
  const currentCount = todayAppointments.filter(apt => apt.timeStatus === 'current').length;
  const completedCount = todayAppointments.filter(apt => apt.status === 'completed').length;
  const totalCount = todayAppointments.length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Schedule
            <span className="text-sm font-normal text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            {overdueCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {overdueCount} Overdue
              </Badge>
            )}
            {currentCount > 0 && (
              <Badge variant="default" className="bg-green-600">
                <BellRing className="h-3 w-3 mr-1" />
                {currentCount} Current
              </Badge>
            )}
            <Badge variant="outline">
              {completedCount}/{totalCount} Complete
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {todayAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No appointments today</h3>
            <p className="text-muted-foreground">Enjoy your day off!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`p-4 rounded-lg border-2 transition-all ${timeStatusColors[appointment.timeStatus]} ${
                  appointment.isOverdue ? 'shadow-md' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Time */}
                    <div className="text-center min-w-[80px]">
                      <div className="font-bold text-lg">
                        {formatTime(appointment.startTime)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(appointment.endTime)}
                      </div>
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{appointment.userName}</span>
                        {appointment.userPhone && (
                          <>
                            <Phone className="h-3 w-3 text-muted-foreground ml-2" />
                            <span className="text-sm text-muted-foreground">
                              {appointment.userPhone}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Stethoscope className="h-3 w-3" />
                        <span>{appointment.serviceName}</span>
                        <span>•</span>
                        <span>{appointment.providerName}</span>
                      </div>
                    </div>

                    {/* Time Status */}
                    <div className="flex items-center gap-2 min-w-[120px] justify-end">
                      {getTimeStatusIcon(appointment)}
                      <span className="text-sm font-medium">
                        {getTimeStatusText(appointment)}
                      </span>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3 ml-4">
                    <Badge variant="outline" className={statusColors[appointment.status]}>
                      {appointment.status}
                    </Badge>
                    
                    {/* Quick Actions */}
                    <div className="flex gap-1">
                      {appointment.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                          className="h-8 px-2"
                        >
                          Confirm
                        </Button>
                      )}
                      {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                          className="h-8 px-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        >
                          Complete
                        </Button>
                      )}
                      {appointment.status === 'confirmed' && appointment.isOverdue && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(appointment.id, 'no_show')}
                          className="h-8 px-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                        >
                          No Show
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {appointment.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Note:</span> {appointment.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}