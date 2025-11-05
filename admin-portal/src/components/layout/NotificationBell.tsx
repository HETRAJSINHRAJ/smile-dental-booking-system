"use client";

import { useState } from 'react';
import { Bell, BellRing, Clock, AlertTriangle, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAppointmentNotifications } from '@/hooks/useAppointmentNotifications';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, overdueCount, currentCount, upcomingCount } = useAppointmentNotifications();

  const totalNotifications = overdueCount + currentCount + upcomingCount;

  const formatTime = (time: string | undefined) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'current':
        return <BellRing className="h-4 w-4 text-green-600" />;
      case 'upcoming':
        return <Timer className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'overdue':
        return 'bg-red-50 border-red-200';
      case 'current':
        return 'bg-green-50 border-green-200';
      case 'upcoming':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {totalNotifications > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {totalNotifications > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {totalNotifications > 9 ? '9+' : totalNotifications}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Appointment Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Today's schedule updates
          </p>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
              <p className="text-xs">All appointments are on track</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {notification.appointment.userName}
                      </p>
                      <p className="text-xs text-muted-foreground mb-1">
                        {formatTime(notification.appointment.startTime)} • {notification.appointment.serviceName}
                      </p>
                      <p className="text-xs">
                        {notification.message}
                      </p>
                    </div>
                    {notification.type === 'overdue' && (
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    )}
                    {notification.type === 'current' && (
                      <Badge variant="default" className="text-xs bg-green-600">
                        Now
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-3 border-t bg-muted/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {overdueCount > 0 && `${overdueCount} overdue`}
                {overdueCount > 0 && currentCount > 0 && ' • '}
                {currentCount > 0 && `${currentCount} current`}
                {(overdueCount > 0 || currentCount > 0) && upcomingCount > 0 && ' • '}
                {upcomingCount > 0 && `${upcomingCount} upcoming`}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setIsOpen(false)}
              >
                View All
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}