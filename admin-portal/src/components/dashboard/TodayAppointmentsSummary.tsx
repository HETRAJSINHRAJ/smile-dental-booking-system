"use client";

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, AlertTriangle, CheckCircle2, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllDocuments } from '@/lib/firebase/firestore';
import type { Appointment } from '@/types/firebase';
import { Timestamp } from 'firebase/firestore';
import Link from 'next/link';

interface AppointmentSummary {
  total: number;
  completed: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  overdue: number;
  current: number;
  upcoming: number;
}

export default function TodayAppointmentsSummary() {
  const [summary, setSummary] = useState<AppointmentSummary>({
    total: 0,
    completed: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    overdue: 0,
    current: 0,
    upcoming: 0,
  });
  const [loading, setLoading] = useState(true);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchTodaysSummary();
    
    // Update every 5 minutes
    const interval = setInterval(fetchTodaysSummary, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTodaysSummary = async () => {
    try {
      setLoading(true);
      const allAppointments = await getAllDocuments<Appointment>('appointments');
      
      // Filter for today's appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayAppointments = allAppointments.filter(apt => {
        const aptDate = apt.appointmentDate instanceof Timestamp 
          ? apt.appointmentDate.toDate() 
          : new Date(apt.appointmentDate);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime();
      });

      // Calculate summary
      const now = new Date();
      let overdue = 0;
      let current = 0;
      let upcoming = 0;
      let nextApt: Appointment | null = null;
      let nextAptMinutes = Infinity;

      todayAppointments.forEach(apt => {
        if (apt.startTime && !['completed', 'cancelled', 'no_show'].includes(apt.status)) {
          const [hours, minutes] = apt.startTime.split(':').map(Number);
          const appointmentTime = new Date(today);
          appointmentTime.setHours(hours, minutes, 0, 0);
          
          const minutesUntil = Math.floor((appointmentTime.getTime() - now.getTime()) / (1000 * 60));
          
          if (minutesUntil <= -30) {
            overdue++;
          } else if (minutesUntil <= 15 && minutesUntil >= -15) {
            current++;
          } else if (minutesUntil > 15) {
            upcoming++;
            if (minutesUntil < nextAptMinutes) {
              nextAptMinutes = minutesUntil;
              nextApt = apt;
            }
          }
        }
      });

      const newSummary: AppointmentSummary = {
        total: todayAppointments.length,
        completed: todayAppointments.filter(apt => apt.status === 'completed').length,
        confirmed: todayAppointments.filter(apt => apt.status === 'confirmed').length,
        pending: todayAppointments.filter(apt => apt.status === 'pending').length,
        cancelled: todayAppointments.filter(apt => apt.status === 'cancelled' || apt.status === 'no_show').length,
        overdue,
        current,
        upcoming,
      };

      setSummary(newSummary);
      setNextAppointment(nextApt);
    } catch (error) {
      console.error('Error fetching today\'s summary:', error);
    } finally {
      setLoading(false);
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

  const getNextAppointmentTime = () => {
    if (!nextAppointment?.startTime) return null;
    
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [hours, minutes] = nextAppointment.startTime.split(':').map(Number);
    const appointmentTime = new Date(today);
    appointmentTime.setHours(hours, minutes, 0, 0);
    
    const minutesUntil = Math.floor((appointmentTime.getTime() - now.getTime()) / (1000 * 60));
    
    if (minutesUntil <= 60) {
      return `in ${minutesUntil} min`;
    } else {
      const hours = Math.floor(minutesUntil / 60);
      const mins = minutesUntil % 60;
      return `in ${hours}h ${mins}m`;
    }
  };

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
          </CardTitle>
          <div className="flex items-center gap-2">
            {summary.overdue > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {summary.overdue} Overdue
              </Badge>
            )}
            {summary.current > 0 && (
              <Badge variant="default" className="bg-green-600">
                <Timer className="h-3 w-3 mr-1" />
                {summary.current} Current
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
            <div className="text-sm text-blue-600">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{summary.completed}</div>
            <div className="text-sm text-green-600">Completed</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
            <div className="text-sm text-yellow-600">Pending</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{summary.confirmed}</div>
            <div className="text-sm text-purple-600">Confirmed</div>
          </div>
        </div>

        {/* Next Appointment */}
        {nextAppointment && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Next Appointment</h4>
                <p className="text-sm text-gray-600">
                  {nextAppointment.userName} • {nextAppointment.serviceName}
                </p>
                <p className="text-sm text-gray-600">
                  {formatTime(nextAppointment.startTime)} • {nextAppointment.providerName}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">
                  {getNextAppointmentTime()}
                </div>
                <Badge variant="outline" className="mt-1">
                  {nextAppointment.status}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href="/appointments">
              <Calendar className="h-4 w-4 mr-2" />
              View All
            </Link>
          </Button>
          {summary.overdue > 0 && (
            <Button asChild variant="destructive" size="sm" className="flex-1">
              <Link href="/appointments">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Handle Overdue
              </Link>
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{summary.completed}/{summary.total} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${summary.total > 0 ? (summary.completed / summary.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}