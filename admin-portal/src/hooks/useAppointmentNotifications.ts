"use client";

import { useState, useEffect } from 'react';
import { getAllDocuments } from '@/lib/firebase/firestore';
import type { Appointment } from '@/types/shared';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

interface AppointmentNotification {
  id: string;
  type: 'overdue' | 'upcoming' | 'current';
  appointment: Appointment;
  message: string;
  minutesOverdue?: number;
}

export function useAppointmentNotifications() {
  const [notifications, setNotifications] = useState<AppointmentNotification[]>([]);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    checkAppointments();
    
    // Check every 5 minutes
    const interval = setInterval(checkAppointments, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkAppointments = async () => {
    try {
      const allAppointments = await getAllDocuments<Appointment>('appointments');
      
      // Filter for today's appointments that are not completed/cancelled
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const activeAppointments = allAppointments.filter(apt => {
        const aptDate = apt.appointmentDate instanceof Timestamp 
          ? apt.appointmentDate.toDate() 
          : new Date(apt.appointmentDate);
        aptDate.setHours(0, 0, 0, 0);
        
        return aptDate.getTime() === today.getTime() && 
               !['completed', 'cancelled', 'no_show'].includes(apt.status);
      });

      const newNotifications: AppointmentNotification[] = [];
      const now = new Date();

      activeAppointments.forEach(apt => {
        if (!apt.startTime) return;

        const [hours, minutes] = apt.startTime.split(':').map(Number);
        const appointmentTime = new Date(today);
        appointmentTime.setHours(hours, minutes, 0, 0);

        const minutesUntil = Math.floor((appointmentTime.getTime() - now.getTime()) / (1000 * 60));

        // Check for overdue appointments (more than 15 minutes past)
        if (minutesUntil <= -15) {
          const minutesOverdue = Math.abs(minutesUntil);
          newNotifications.push({
            id: `overdue-${apt.id}`,
            type: 'overdue',
            appointment: apt,
            message: `${apt.userName}'s appointment is ${minutesOverdue} minutes overdue`,
            minutesOverdue,
          });
        }
        // Check for current appointments (within 15 minutes)
        else if (minutesUntil <= 15 && minutesUntil >= -5) {
          newNotifications.push({
            id: `current-${apt.id}`,
            type: 'current',
            appointment: apt,
            message: `${apt.userName}'s appointment is starting now`,
          });
        }
        // Check for upcoming appointments (15-30 minutes ahead)
        else if (minutesUntil <= 30 && minutesUntil > 15) {
          newNotifications.push({
            id: `upcoming-${apt.id}`,
            type: 'upcoming',
            appointment: apt,
            message: `${apt.userName}'s appointment is in ${minutesUntil} minutes`,
          });
        }
      });

      // Show toast notifications for new overdue appointments
      const currentTime = new Date();
      const newOverdueNotifications = newNotifications.filter(n => 
        n.type === 'overdue' && 
        !notifications.some(existing => existing.id === n.id)
      );

      newOverdueNotifications.forEach(notification => {
        // Only show toast if this is a new overdue notification since last check
        if (currentTime.getTime() - lastCheck.getTime() > 4 * 60 * 1000) { // 4 minutes buffer
          toast.error(notification.message, {
            duration: 10000,
            action: {
              label: 'View',
              onClick: () => {
                // Could navigate to appointment details
                console.log('Navigate to appointment:', notification.appointment.id);
              },
            },
          });
        }
      });

      setNotifications(newNotifications);
      setLastCheck(currentTime);
    } catch (error) {
      console.error('Error checking appointments:', error);
    }
  };

  const getOverdueCount = () => notifications.filter(n => n.type === 'overdue').length;
  const getCurrentCount = () => notifications.filter(n => n.type === 'current').length;
  const getUpcomingCount = () => notifications.filter(n => n.type === 'upcoming').length;

  return {
    notifications,
    overdueCount: getOverdueCount(),
    currentCount: getCurrentCount(),
    upcomingCount: getUpcomingCount(),
    refreshNotifications: checkAppointments,
  };
}