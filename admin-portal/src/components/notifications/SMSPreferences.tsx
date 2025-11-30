'use client';

import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationPreferences } from '@/types/shared';

interface SMSPreferencesProps {
  preferences: NotificationPreferences;
  onUpdate: (preferences: NotificationPreferences) => Promise<void>;
  disabled?: boolean;
}

export function SMSPreferences({ preferences, onUpdate, disabled = false }: SMSPreferencesProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (field: keyof NotificationPreferences['sms'], value: boolean) => {
    setIsUpdating(true);
    try {
      const updatedPreferences = {
        ...preferences,
        sms: {
          ...preferences.sms,
          [field]: value,
        },
      };
      await onUpdate(updatedPreferences);
    } catch (error) {
      console.error('Error updating SMS preferences:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS Notifications</CardTitle>
        <CardDescription>
          Manage your SMS notification preferences. Standard messaging rates may apply.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sms-enabled">Enable SMS Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive text messages for important updates
            </p>
          </div>
          <Switch
            id="sms-enabled"
            checked={preferences.sms.enabled}
            onCheckedChange={(checked) => handleToggle('enabled', checked)}
            disabled={disabled || isUpdating}
          />
        </div>

        {preferences.sms.enabled && (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-appointment-reminders">Appointment Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded 24 hours before your appointment
                </p>
              </div>
              <Switch
                id="sms-appointment-reminders"
                checked={preferences.sms.appointmentReminders}
                onCheckedChange={(checked) => handleToggle('appointmentReminders', checked)}
                disabled={disabled || isUpdating}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-appointment-updates">Appointment Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about appointment confirmations and cancellations
                </p>
              </div>
              <Switch
                id="sms-appointment-updates"
                checked={preferences.sms.appointmentUpdates}
                onCheckedChange={(checked) => handleToggle('appointmentUpdates', checked)}
                disabled={disabled || isUpdating}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-payment-updates">Payment Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about payment confirmations and receipts
                </p>
              </div>
              <Switch
                id="sms-payment-updates"
                checked={preferences.sms.paymentUpdates}
                onCheckedChange={(checked) => handleToggle('paymentUpdates', checked)}
                disabled={disabled || isUpdating}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
