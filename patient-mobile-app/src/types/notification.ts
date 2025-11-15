import { Timestamp } from '@react-native-firebase/firestore';

export type NotificationType = 
  | 'appointment_confirmed'
  | 'appointment_reminder'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  | 'payment_success'
  | 'payment_failed'
  | 'general'
  | 'promotional';

export interface PushNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  appointmentId?: string;
  read: boolean;
  createdAt: Timestamp;
  sentAt?: Timestamp;
  readAt?: Timestamp;
}

export interface FCMToken {
  id?: string;
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId: string;
  deviceName?: string;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastUsedAt?: Timestamp;
}

export interface NotificationPreferences {
  userId: string;
  appointmentReminders: boolean;
  appointmentUpdates: boolean;
  paymentUpdates: boolean;
  promotional: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}
