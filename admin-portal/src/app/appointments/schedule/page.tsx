"use client";

import { useState, useEffect } from 'react';
import { CalendarClock, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAllDocuments, getProviders } from '@/lib/firebase/firestore';
import type { Appointment, Provider } from '@/types/firebase';
import { toast } from 'sonner';

export default function SchedulePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProvider, setSelectedProvider] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, providersData] = await Promise.all([
        getAllDocuments<Appointment>('appointments'),
        getProviders()
      ]);
      
      setAppointments(appointmentsData);
      setProviders(providersData);
    } catch (error) {
      console.error('Error loading schedule data:', error);
      toast.error('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Filter appointments for selected date and provider
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = appointment.appointmentDate?.toDate?.() || new Date(appointment.appointmentDate);
    const isSameDate = appointmentDate.toDateString() === selectedDate.toDateString();
    const matchesProvider = selectedProvider === 'all' || appointment.providerId === selectedProvider;
    const isNotCancelled = appointment.status !== 'cancelled';
    
    return isSameDate && matchesProvider && isNotCancelled;
  });

  // Sort appointments by start time
  const sortedAppointments = filteredAppointments.sort((a, b) => {
    const timeA = a.startTime.split(':').map(Number);
    const timeB = b.startTime.split(':').map(Number);
    const minutesA = timeA[0] * 60 + timeA[1];
    const minutesB = timeB[0] * 60 + timeB[1];
    return minutesA - minutesB;
  });

  // Generate time slots for the day (9 AM to 5 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeSlot);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'no_show':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarClock className="h-8 w-8 text-primary" />
            Schedule View
          </h1>
          <p className="text-muted-foreground mt-2">
            Daily appointment schedule and timeline
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daily Schedule</CardTitle>
              <CardDescription>{formatDate(selectedDate)}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Today
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-lg font-semibold min-w-[200px] text-center">
                {selectedDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Provider Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Provider:</span>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Schedule Timeline */}
          <div className="space-y-2">
            {timeSlots.map((timeSlot) => {
              const appointmentsAtTime = sortedAppointments.filter(apt => apt.startTime === timeSlot);
              
              return (
                <div key={timeSlot} className="flex items-start gap-4 py-2 border-b border-gray-100 last:border-b-0">
                  <div className="w-20 text-sm font-medium text-muted-foreground shrink-0">
                    {formatTime(timeSlot)}
                  </div>
                  <div className="flex-1 min-h-[40px]">
                    {appointmentsAtTime.length === 0 ? (
                      <div className="text-sm text-muted-foreground italic py-2">
                        No appointments
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {appointmentsAtTime.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{appointment.userName}</span>
                                <Badge variant="outline" className={getStatusColor(appointment.status)}>
                                  {appointment.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {appointment.serviceName} • {appointment.providerName}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{appointment.confirmationNumber}</div>
                              <div className="text-xs text-muted-foreground">{appointment.userEmail}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Total appointments for {selectedDate.toLocaleDateString()}:
              </span>
              <span className="font-medium">
                {sortedAppointments.length} appointment{sortedAppointments.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}