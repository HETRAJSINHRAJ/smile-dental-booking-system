import { Metadata } from 'next';
import NotificationAnalyticsDashboard from '@/components/notifications/NotificationAnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Notification Analytics | Admin Portal',
  description: 'View notification performance metrics and analytics',
};

export default function NotificationAnalyticsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification Analytics</h1>
        <p className="text-muted-foreground">
          Track notification delivery, open rates, and click-through rates across all channels.
        </p>
      </div>

      <NotificationAnalyticsDashboard />
    </div>
  );
}
