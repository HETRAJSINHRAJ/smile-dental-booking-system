# Waitlist Integration Guide

## Overview
The waitlist notification system automatically notifies patients when appointment slots become available.

## Integration Points

### 1. Appointment Cancellation
When an appointment is cancelled in the admin portal, the system should notify the next person on the waitlist.

**Location:** `admin-portal/src/app/appointments/page.tsx`

**Integration Code:**
```typescript
import { notifyNextWaitlistUser } from '@/lib/waitlist/waitlistNotificationService';

// In the handleStatusUpdate function, after sending cancellation notification:
if (newStatus === 'cancelled') {
  // Send cancellation notification
  await sendAppointmentCancellation(appointment.userId, {
    serviceName: appointment.serviceName,
    providerName: appointment.providerName,
    date: formattedDate,
    time: appointment.startTime,
    appointmentId: appointment.id,
  });
  
  // Notify waitlist users about the available slot
  try {
    const notified = await notifyNextWaitlistUser(
      appointment.providerId,
      appointment.serviceId,
      appointmentDate,
      appointment.startTime
    );
    
    if (notified) {
      toast.success('Appointment cancelled, notifications sent, and waitlist user notified! 🔔');
    } else {
      toast.success('Appointment cancelled and notification sent! 🔔');
    }
  } catch (error) {
    console.error('Error notifying waitlist:', error);
    toast.success('Appointment cancelled and notification sent! 🔔');
  }
}
```

### 2. Scheduled Cleanup (Cloud Function)
Create a scheduled cloud function to expire old waitlist notifications (24 hours passed).

**Recommended Schedule:** Every hour

**Function Code:**
```typescript
import { expireOldWaitlistNotifications } from './lib/waitlist/waitlistNotificationService';

export const cleanupExpiredWaitlist = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const expiredCount = await expireOldWaitlistNotifications();
    console.log(`Expired ${expiredCount} waitlist notifications`);
    return null;
  });
```

### 3. Manual Waitlist Notification (Admin Portal)
Admins can manually notify waitlist users from the waitlist management page.

## Environment Variables
Ensure the following environment variable is set:
- `NEXT_PUBLIC_APP_URL`: The base URL of the patient portal (e.g., https://yourapp.com)

## Testing
1. Create a waitlist entry for a specific date/time
2. Cancel an appointment for that date/time
3. Verify that the waitlist user receives an email notification
4. Check that the waitlist entry status is updated to 'notified'
5. Verify that the expiration time is set to 24 hours from notification

## Notes
- Waitlist notifications are sent in order of registration (FIFO)
- Users have 24 hours to book after being notified
- After 24 hours, the entry expires and the next person is notified
- The system only notifies one person at a time to avoid double-booking
