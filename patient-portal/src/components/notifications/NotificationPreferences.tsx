'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationPreferences as NotificationPreferencesType } from '@/types/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, MessageSquare, Smartphone, Clock } from 'lucide-react';
import { toast } from 'sonner';

const defaultPreferences: Omit<NotificationPreferencesType, 'userId' | 'updatedAt'> = {
  email: {
    enabled: true,
    appointmentReminders: true,
    appointmentUpdates: true,
    paymentUpdates: true,
    promotional: false,
  },
  sms: {
    enabled: false,
    appointmentReminders: false,
    appointmentUpdates: false,
    paymentUpdates: false,
  },
  push: {
    enabled: true,
    appointmentReminders: true,
    appointmentUpdates: true,
    paymentUpdates: true,
    promotional: false,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  language: 'en',
};

export default function NotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Omit<NotificationPreferencesType, 'userId' | 'updatedAt'>>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const prefsDoc = await getDoc(doc(db, 'notificationPreferences', user.uid));
      
      if (prefsDoc.exists()) {
        const data = prefsDoc.data() as NotificationPreferencesType;
        setPreferences({
          email: data.email,
          sms: data.sms,
          push: data.push,
          quietHours: data.quietHours,
          language: data.language,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await setDoc(doc(db, 'notificationPreferences', user.uid), {
        userId: user.uid,
        ...preferences,
        updatedAt: Timestamp.now(),
      });

      toast.success('Notification preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const updateEmailPreference = (key: keyof NotificationPreferencesType['email'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      email: { ...prev.email, [key]: value },
    }));
  };

  const updateSmsPreference = (key: keyof NotificationPreferencesType['sms'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      sms: { ...prev.sms, [key]: value },
    }));
  };

  const updatePushPreference = (key: keyof NotificationPreferencesType['push'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      push: { ...prev.push, [key]: value },
    }));
  };

  const updateQuietHours = (key: keyof NotificationPreferencesType['quietHours'], value: string | boolean) => {
    setPreferences(prev => ({
      ...prev,
      quietHours: { ...prev.quietHours, [key]: value },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Email Notifications</CardTitle>
          </div>
          <CardDescription>
            Manage your email notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-enabled" className="flex flex-col gap-1">
              <span className="font-medium">Enable Email Notifications</span>
              <span className="text-sm text-muted-foreground">
                Receive notifications via email
              </span>
            </Label>
            <Switch
              id="email-enabled"
              checked={preferences.email.enabled}
              onCheckedChange={(checked) => updateEmailPreference('enabled', checked)}
            />
          </div>

          {preferences.email.enabled && (
            <>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-reminders">Appointment Reminders</Label>
                <Switch
                  id="email-reminders"
                  checked={preferences.email.appointmentReminders}
                  onCheckedChange={(checked) => updateEmailPreference('appointmentReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email-updates">Appointment Updates</Label>
                <Switch
                  id="email-updates"
                  checked={preferences.email.appointmentUpdates}
                  onCheckedChange={(checked) => updateEmailPreference('appointmentUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email-payments">Payment Updates</Label>
                <Switch
                  id="email-payments"
                  checked={preferences.email.paymentUpdates}
                  onCheckedChange={(checked) => updateEmailPreference('paymentUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email-promotional">Promotional Emails</Label>
                <Switch
                  id="email-promotional"
                  checked={preferences.email.promotional}
                  onCheckedChange={(checked) => updateEmailPreference('promotional', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>SMS Notifications</CardTitle>
          </div>
          <CardDescription>
            Manage your SMS notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-enabled" className="flex flex-col gap-1">
              <span className="font-medium">Enable SMS Notifications</span>
              <span className="text-sm text-muted-foreground">
                Receive notifications via SMS
              </span>
            </Label>
            <Switch
              id="sms-enabled"
              checked={preferences.sms.enabled}
              onCheckedChange={(checked) => updateSmsPreference('enabled', checked)}
            />
          </div>

          {preferences.sms.enabled && (
            <>
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-reminders">Appointment Reminders</Label>
                <Switch
                  id="sms-reminders"
                  checked={preferences.sms.appointmentReminders}
                  onCheckedChange={(checked) => updateSmsPreference('appointmentReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sms-updates">Appointment Updates</Label>
                <Switch
                  id="sms-updates"
                  checked={preferences.sms.appointmentUpdates}
                  onCheckedChange={(checked) => updateSmsPreference('appointmentUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sms-payments">Payment Updates</Label>
                <Switch
                  id="sms-payments"
                  checked={preferences.sms.paymentUpdates}
                  onCheckedChange={(checked) => updateSmsPreference('paymentUpdates', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle>Push Notifications</CardTitle>
          </div>
          <CardDescription>
            Manage your push notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="push-enabled" className="flex flex-col gap-1">
              <span className="font-medium">Enable Push Notifications</span>
              <span className="text-sm text-muted-foreground">
                Receive notifications on your device
              </span>
            </Label>
            <Switch
              id="push-enabled"
              checked={preferences.push.enabled}
              onCheckedChange={(checked) => updatePushPreference('enabled', checked)}
            />
          </div>

          {preferences.push.enabled && (
            <>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-reminders">Appointment Reminders</Label>
                <Switch
                  id="push-reminders"
                  checked={preferences.push.appointmentReminders}
                  onCheckedChange={(checked) => updatePushPreference('appointmentReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="push-updates">Appointment Updates</Label>
                <Switch
                  id="push-updates"
                  checked={preferences.push.appointmentUpdates}
                  onCheckedChange={(checked) => updatePushPreference('appointmentUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="push-payments">Payment Updates</Label>
                <Switch
                  id="push-payments"
                  checked={preferences.push.paymentUpdates}
                  onCheckedChange={(checked) => updatePushPreference('paymentUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="push-promotional">Promotional Notifications</Label>
                <Switch
                  id="push-promotional"
                  checked={preferences.push.promotional}
                  onCheckedChange={(checked) => updatePushPreference('promotional', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Quiet Hours</CardTitle>
          </div>
          <CardDescription>
            Set times when you don't want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="quiet-hours-enabled" className="flex flex-col gap-1">
              <span className="font-medium">Enable Quiet Hours</span>
              <span className="text-sm text-muted-foreground">
                Pause notifications during specific hours
              </span>
            </Label>
            <Switch
              id="quiet-hours-enabled"
              checked={preferences.quietHours.enabled}
              onCheckedChange={(checked) => updateQuietHours('enabled', checked)}
            />
          </div>

          {preferences.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet-start">Start Time</Label>
                <Select
                  value={preferences.quietHours.start}
                  onValueChange={(value) => updateQuietHours('start', value)}
                >
                  <SelectTrigger id="quiet-start">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiet-end">End Time</Label>
                <Select
                  value={preferences.quietHours.end}
                  onValueChange={(value) => updateQuietHours('end', value)}
                >
                  <SelectTrigger id="quiet-end">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
