import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import firestore from '@react-native-firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FCMToken, PushNotification, NotificationType } from '../types/notification';

const STORAGE_KEY = '@fcm_token';
const DEVICE_ID_KEY = '@device_id';

class NotificationService {
  private initialized = false;

  /**
   * Initialize notification service
   * Call this on app startup
   */
  async initialize(userId: string): Promise<void> {
    if (this.initialized) return;

    try {
      // Request permissions
      const authStatus = await this.requestPermission();
      
      if (authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
          authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
        
        // Create notification channel for Android
        await this.createNotificationChannels();
        
        // Get and save FCM token
        await this.saveFCMToken(userId);
        
        // Setup listeners
        this.setupForegroundListener();
        this.setupBackgroundListener();
        this.setupNotificationOpenedListener();
        this.setupTokenRefreshListener(userId);
        
        this.initialized = true;
        console.log('Notification service initialized');
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<number> {
    const authStatus = await messaging().requestPermission();
    return authStatus;
  }

  /**
   * Create Android notification channels
   */
  async createNotificationChannels(): Promise<void> {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Notifications',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });

      await notifee.createChannel({
        id: 'appointments',
        name: 'Appointment Notifications',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });

      await notifee.createChannel({
        id: 'payments',
        name: 'Payment Notifications',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });

      await notifee.createChannel({
        id: 'reminders',
        name: 'Appointment Reminders',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });
    }
  }

  /**
   * Get FCM token and save to Firestore
   */
  async saveFCMToken(userId: string): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      const deviceId = await this.getDeviceId();
      
      if (token) {
        const tokenData: Omit<FCMToken, 'id'> = {
          userId,
          token,
          platform: Platform.OS as 'ios' | 'android',
          deviceId,
          deviceName: Platform.OS === 'ios' ? 'iPhone' : 'Android Device',
          active: true,
          createdAt: firestore.Timestamp.now(),
          updatedAt: firestore.Timestamp.now(),
          lastUsedAt: firestore.Timestamp.now(),
        };

        // Save to Firestore
        const tokensRef = firestore().collection('fcmTokens');
        const existingToken = await tokensRef
          .where('userId', '==', userId)
          .where('deviceId', '==', deviceId)
          .limit(1)
          .get();

        if (existingToken.empty) {
          await tokensRef.add(tokenData);
        } else {
          await existingToken.docs[0].ref.update({
            token,
            active: true,
            updatedAt: firestore.Timestamp.now(),
            lastUsedAt: firestore.Timestamp.now(),
          });
        }

        // Save locally
        await AsyncStorage.setItem(STORAGE_KEY, token);
        console.log('FCM token saved:', token);
        return token;
      }
      return null;
    } catch (error) {
      console.error('Error saving FCM token:', error);
      return null;
    }
  }

  /**
   * Get or generate device ID
   */
  private async getDeviceId(): Promise<string> {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }

  /**
   * Setup foreground message listener
   */
  private setupForegroundListener(): void {
    messaging().onMessage(async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);
      await this.displayNotification(remoteMessage);
    });
  }

  /**
   * Setup background message listener
   */
  private setupBackgroundListener(): void {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message received:', remoteMessage);
      await this.displayNotification(remoteMessage);
    });
  }

  /**
   * Setup notification opened listener
   */
  private setupNotificationOpenedListener(): void {
    // Handle notification opened from quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification opened app from quit state:', remoteMessage);
          this.handleNotificationOpen(remoteMessage);
        }
      });

    // Handle notification opened from background state
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened app from background:', remoteMessage);
      this.handleNotificationOpen(remoteMessage);
    });

    // Handle notifee notification press
    notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log('Notifee notification pressed:', detail);
        if (detail.notification?.data) {
          this.handleNotificationOpen(detail.notification.data as any);
        }
      }
    });
  }

  /**
   * Setup token refresh listener
   */
  private setupTokenRefreshListener(userId: string): void {
    messaging().onTokenRefresh(token => {
      console.log('FCM token refreshed:', token);
      this.saveFCMToken(userId);
    });
  }

  /**
   * Display notification using Notifee
   */
  private async displayNotification(remoteMessage: any): Promise<void> {
    try {
      const { notification, data } = remoteMessage;
      
      if (!notification) return;

      const channelId = this.getChannelId(data?.type);

      await notifee.displayNotification({
        title: notification.title,
        body: notification.body,
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
          // Use default launcher icon if custom icon doesn't exist
          smallIcon: 'ic_launcher',
          color: '#4F46E5',
        },
        ios: {
          sound: 'default',
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
        data: data || {},
      });
    } catch (error) {
      console.error('Error displaying notification:', error);
    }
  }

  /**
   * Get appropriate channel ID based on notification type
   */
  private getChannelId(type?: NotificationType): string {
    switch (type) {
      case 'appointment_confirmed':
      case 'appointment_cancelled':
      case 'appointment_rescheduled':
        return 'appointments';
      case 'appointment_reminder':
        return 'reminders';
      case 'payment_success':
      case 'payment_failed':
        return 'payments';
      default:
        return 'default';
    }
  }

  /**
   * Handle notification open/press
   */
  private handleNotificationOpen(remoteMessage: any): void {
    const { data } = remoteMessage;
    
    if (data?.appointmentId) {
      // Navigate to appointment details
      // You'll need to implement navigation logic here
      console.log('Navigate to appointment:', data.appointmentId);
    }
    
    if (data?.screen) {
      // Navigate to specific screen
      console.log('Navigate to screen:', data.screen);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await firestore()
        .collection('notifications')
        .doc(notificationId)
        .update({
          read: true,
          readAt: firestore.Timestamp.now(),
        });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, limit: number = 50): Promise<PushNotification[]> {
    try {
      const snapshot = await firestore()
        .collection('notifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PushNotification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const snapshot = await firestore()
        .collection('notifications')
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();

      return snapshot.size;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Delete FCM token (on logout)
   */
  async deleteFCMToken(userId: string): Promise<void> {
    try {
      const deviceId = await this.getDeviceId();
      const tokensRef = firestore().collection('fcmTokens');
      
      const snapshot = await tokensRef
        .where('userId', '==', userId)
        .where('deviceId', '==', deviceId)
        .get();

      const batch = firestore().batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { active: false });
      });
      await batch.commit();

      await AsyncStorage.removeItem(STORAGE_KEY);
      await messaging().deleteToken();
      
      this.initialized = false;
      console.log('FCM token deleted');
    } catch (error) {
      console.error('Error deleting FCM token:', error);
    }
  }

  /**
   * Schedule local notification
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    date: Date,
    data?: Record<string, any>
  ): Promise<string> {
    const trigger = {
      type: 0, // TriggerType.TIMESTAMP
      timestamp: date.getTime(),
    };

    const notificationId = await notifee.createTriggerNotification(
      {
        title,
        body,
        android: {
          channelId: 'reminders',
          importance: AndroidImportance.HIGH,
        },
        ios: {
          sound: 'default',
        },
        data: data || {},
      },
      trigger as any
    );

    return notificationId;
  }

  /**
   * Cancel scheduled notification
   */
  async cancelScheduledNotification(notificationId: string): Promise<void> {
    await notifee.cancelNotification(notificationId);
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return await notifee.getBadgeCount();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await notifee.setBadgeCount(count);
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    await notifee.cancelAllNotifications();
  }
}

export default new NotificationService();
