# Push Notification Setup Guide

This guide explains how to set up push notifications for the Patient Mobile App using Firebase Cloud Messaging (FCM) and Notifee.

## Prerequisites

- Firebase project with Cloud Messaging enabled
- Android/iOS app registered in Firebase Console
- `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) files

## Installation

The required packages are already installed:
- `@react-native-firebase/messaging@21.14.0`
- `@notifee/react-native@^9.1.8`

## Android Setup

### 1. Firebase Configuration

Ensure `google-services.json` is placed in:
```
android/app/google-services.json
```

### 2. Build Configuration

The `android/app/build.gradle` should already have:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### 3. Permissions

Already configured in `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
```

### 4. Notification Icon

Add notification icons to:
```
android/app/src/main/res/drawable-*/ic_notification.png
```

You can generate icons using: https://romannurik.github.io/AndroidAssetStudio/icons-notification.html

## iOS Setup

### 1. Firebase Configuration

Add `GoogleService-Info.plist` to the iOS project in Xcode.

### 2. Enable Push Notifications

In Xcode:
1. Open `ios/patient.xcworkspace`
2. Select your target
3. Go to "Signing & Capabilities"
4. Click "+ Capability"
5. Add "Push Notifications"
6. Add "Background Modes" and enable "Remote notifications"

### 3. Update AppDelegate

The AppDelegate should import Firebase:
```swift
import Firebase
import UserNotifications

// In didFinishLaunchingWithOptions
FirebaseApp.configure()
UNUserNotificationCenter.current().delegate = self
```

### 4. Install Pods

```bash
cd ios
pod install
cd ..
```

## Usage

### Initialize Notifications

Notifications are automatically initialized when a user logs in. The service is initialized in `AuthContext`:

```typescript
import notificationService from './services/notificationService';

// After successful login
await notificationService.initialize(user.uid);
```

### Display Notification Bell

```typescript
import { NotificationBell } from './components/NotificationBell';

<NotificationBell 
  onPress={() => navigation.navigate('Notifications')}
  color="#000"
  size={24}
/>
```

### Use Notifications Hook

```typescript
import { useNotifications } from './hooks/useNotifications';

const { notifications, unreadCount, loading, markAsRead } = useNotifications();
```

### Schedule Local Notification

```typescript
import notificationService from './services/notificationService';

const notificationId = await notificationService.scheduleLocalNotification(
  'Appointment Reminder',
  'You have an appointment tomorrow at 10:00 AM',
  new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
  { appointmentId: '123' }
);
```

## Backend Integration

### Admin Portal - Send Notifications

```typescript
import { useNotificationSender } from '@/hooks/useNotificationSender';

const { sendAppointmentConfirmation } = useNotificationSender();

await sendAppointmentConfirmation(userId, {
  serviceName: 'Dental Cleaning',
  providerName: 'Dr. Smith',
  date: '2024-01-15',
  time: '10:00 AM',
  appointmentId: 'apt123',
});
```

### API Endpoints

**Send Notification:**
```
POST /api/notifications/send
{
  "userId": "user123",
  "title": "Appointment Confirmed",
  "body": "Your appointment has been confirmed",
  "type": "appointment_confirmed",
  "appointmentId": "apt123"
}
```

**Schedule Daily Reminders (Cron Job):**
```
POST /api/notifications/schedule-reminders
Authorization: Bearer YOUR_CRON_SECRET
```

## Firestore Collections

### fcmTokens
```typescript
{
  userId: string;
  token: string;
  platform: 'ios' | 'android';
  deviceId: string;
  deviceName: string;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastUsedAt: Timestamp;
}
```

### notifications
```typescript
{
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data: Record<string, any>;
  appointmentId?: string;
  read: boolean;
  createdAt: Timestamp;
  sentAt: Timestamp;
  readAt?: Timestamp;
}
```

## Notification Types

- `appointment_confirmed` - Appointment confirmation
- `appointment_reminder` - Appointment reminder (24h before)
- `appointment_cancelled` - Appointment cancellation
- `appointment_rescheduled` - Appointment rescheduled
- `payment_success` - Payment successful
- `payment_failed` - Payment failed
- `general` - General notifications
- `promotional` - Promotional messages

## Testing

### Test on Android

```bash
npm run android
```

### Test on iOS

```bash
npm run ios
```

### Send Test Notification

Use Firebase Console:
1. Go to Cloud Messaging
2. Click "Send your first message"
3. Enter title and body
4. Select your app
5. Send test message

Or use the admin portal to send notifications to specific users.

## Troubleshooting

### Android

**Issue:** Notifications not appearing
- Check if POST_NOTIFICATIONS permission is granted
- Verify google-services.json is correct
- Check logcat for errors: `adb logcat | grep -i firebase`

**Issue:** Background notifications not working
- Ensure background handler is registered in index.js
- Check if app has battery optimization disabled

### iOS

**Issue:** Notifications not appearing
- Verify Push Notifications capability is enabled
- Check if notification permissions are granted
- Verify APNs certificate in Firebase Console

**Issue:** Background notifications not working
- Enable "Background Modes" > "Remote notifications"
- Check if app is not force-quit (iOS limitation)

## Production Checklist

- [ ] Upload APNs certificate to Firebase Console (iOS)
- [ ] Test notifications on physical devices
- [ ] Set up cron job for daily reminders
- [ ] Configure notification icons for all densities (Android)
- [ ] Test notification deep linking
- [ ] Implement notification preferences
- [ ] Set up analytics for notification engagement
- [ ] Test token refresh scenarios
- [ ] Implement notification batching for multiple updates
- [ ] Add notification sound customization

## Environment Variables

Add to `.env`:
```
CRON_SECRET=your_secret_key_for_cron_jobs
```

## Cron Job Setup (Vercel)

Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/notifications/schedule-reminders",
    "schedule": "0 9 * * *"
  }]
}
```

This runs daily at 9 AM to send appointment reminders.

## Security

- FCM tokens are stored securely in Firestore
- Inactive tokens are automatically deactivated
- Notification API endpoints should be protected
- Use CRON_SECRET for scheduled jobs
- Implement rate limiting for notification sending

## Best Practices

1. **Token Management**: Clean up inactive tokens regularly
2. **Batching**: Send bulk notifications efficiently
3. **Personalization**: Use user's name and specific details
4. **Timing**: Send reminders at appropriate times
5. **Frequency**: Don't spam users with too many notifications
6. **Deep Linking**: Navigate users to relevant screens
7. **Analytics**: Track notification open rates
8. **Testing**: Test on both platforms before release
9. **Fallback**: Have email/SMS backup for critical notifications
10. **Preferences**: Allow users to customize notification settings
