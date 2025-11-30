import { Metadata } from 'next';
import NotificationPreferences from '@/components/notifications/NotificationPreferences';

export const metadata: Metadata = {
  title: 'Notification Preferences | Patient Portal',
  description: 'Manage your notification preferences',
};

export default function NotificationPreferencesPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification Preferences</h1>
        <p className="text-muted-foreground">
          Customize how and when you receive notifications about your appointments and updates.
        </p>
      </div>

      <NotificationPreferences />
    </div>
  );
}
