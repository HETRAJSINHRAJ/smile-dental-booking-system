import { Timestamp } from 'firebase/firestore';

export type NotificationType = 
  | 'appointment_confirmed'
  | 'appointment_reminder'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  | 'payment_success'
  | 'payment_failed'
  | 'general'
  | 'promotional';

export type NotificationChannel = 'email' | 'sms' | 'push';

export type NotificationStatus = 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';

export interface NotificationQueueItem {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  title: string;
  body: string;
  type: NotificationType;
  channels: NotificationChannel[];
  data?: Record<string, any>;
  appointmentId?: string;
  status: NotificationStatus;
  scheduledFor?: Timestamp;
  sentAt?: Timestamp;
  failedAt?: Timestamp;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NotificationBatch {
  id?: string;
  items: string[]; // Array of NotificationQueueItem IDs
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalItems: number;
  sentItems: number;
  failedItems: number;
  createdAt: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
}

export interface NotificationDeliveryLog {
  id?: string;
  notificationId: string;
  userId: string;
  channel: NotificationChannel;
  status: 'sent' | 'failed' | 'bounced' | 'opened' | 'clicked';
  sentAt?: Timestamp;
  openedAt?: Timestamp;
  clickedAt?: Timestamp;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: Timestamp;
}
