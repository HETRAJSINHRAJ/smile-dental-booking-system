/**
 * Waitlist Notification Service
 * 
 * Handles notifications for waitlist users when slots become available
 */

import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Waitlist } from '@/types/shared';

/**
 * Find waitlist entries for a specific provider, service, and date
 */
export async function findWaitlistEntries(
  providerId: string,
  serviceId: string,
  appointmentDate: Date
): Promise<Waitlist[]> {
  try {
    const dateStart = new Date(appointmentDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(appointmentDate);
    dateEnd.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, 'waitlist'),
      where('providerId', '==', providerId),
      where('serviceId', '==', serviceId),
      where('preferredDate', '>=', Timestamp.fromDate(dateStart)),
      where('preferredDate', '<=', Timestamp.fromDate(dateEnd)),
      where('status', '==', 'active'),
      orderBy('createdAt', 'asc'),
      limit(10)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Waitlist[];
  } catch (error) {
    console.error('Error finding waitlist entries:', error);
    return [];
  }
}

/**
 * Notify the next person on the waitlist
 */
export async function notifyNextWaitlistUser(
  providerId: string,
  serviceId: string,
  appointmentDate: Date,
  availableTime: string
): Promise<boolean> {
  try {
    const waitlistEntries = await findWaitlistEntries(
      providerId,
      serviceId,
      appointmentDate
    );

    if (waitlistEntries.length === 0) {
      console.log('No waitlist entries found');
      return false;
    }

    // Notify the first person in the queue
    const firstEntry = waitlistEntries[0];
    
    // Calculate expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Update waitlist entry status
    await updateDoc(doc(db, 'waitlist', firstEntry.id), {
      status: 'notified',
      notifiedAt: Timestamp.now(),
      notificationSent: true,
      expiresAt: Timestamp.fromDate(expiresAt),
      updatedAt: Timestamp.now(),
    });

    // Send email notification
    await sendWaitlistNotificationEmail(firstEntry, availableTime, expiresAt);

    console.log(`Notified waitlist user: ${firstEntry.userEmail}`);
    return true;
  } catch (error) {
    console.error('Error notifying waitlist user:', error);
    return false;
  }
}

/**
 * Send waitlist notification email
 */
async function sendWaitlistNotificationEmail(
  entry: Waitlist,
  availableTime: string,
  expiresAt: Date
): Promise<void> {
  const appointmentDate = entry.preferredDate.toDate();
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Appointment Slot Available!</h2>
      <p>Good news! A slot has opened up for your preferred appointment.</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Appointment Details</h3>
        <p><strong>Service:</strong> ${entry.serviceName}</p>
        <p><strong>Provider:</strong> ${entry.providerName}</p>
        <p><strong>Date:</strong> ${appointmentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}</p>
        <p><strong>Time:</strong> ${availableTime}</p>
      </div>
      
      <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
        <p style="margin: 0;"><strong>⏰ Act Fast!</strong></p>
        <p style="margin: 5px 0 0 0;">This slot is reserved for you until ${expiresAt.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })}. After that, it will be offered to the next person on the waitlist.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/booking/datetime?serviceId=${entry.serviceId}&providerId=${entry.providerId}&date=${appointmentDate.toISOString().split('T')[0]}" 
           style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Book Now
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px;">
        If you no longer need this appointment, please cancel your waitlist entry so we can notify the next person.
      </p>
    </div>
  `;

  // TODO: Send email notification
  // The email service needs to be updated to support custom emails
  // For now, we'll just log the notification
  console.log('📧 Waitlist notification email would be sent to:', entry.userEmail);
  console.log('Subject:', `Appointment Slot Available - ${entry.serviceName}`);
}

/**
 * Check and expire old waitlist notifications (24 hours passed)
 */
export async function expireOldWaitlistNotifications(): Promise<number> {
  try {
    const now = Timestamp.now();
    
    const q = query(
      collection(db, 'waitlist'),
      where('status', '==', 'notified'),
      where('expiresAt', '<=', now)
    );

    const snapshot = await getDocs(q);
    let expiredCount = 0;

    for (const docSnapshot of snapshot.docs) {
      await updateDoc(doc(db, 'waitlist', docSnapshot.id), {
        status: 'expired',
        updatedAt: Timestamp.now(),
      });
      expiredCount++;
    }

    console.log(`Expired ${expiredCount} waitlist notifications`);
    return expiredCount;
  } catch (error) {
    console.error('Error expiring waitlist notifications:', error);
    return 0;
  }
}

/**
 * Auto-remove expired waitlist entries and notify next person
 */
export async function processExpiredWaitlistEntries(): Promise<void> {
  try {
    // First, expire old notifications
    await expireOldWaitlistNotifications();

    // Then, for each expired entry, notify the next person if slot is still available
    // This would typically be done in a scheduled cloud function
    console.log('Processed expired waitlist entries');
  } catch (error) {
    console.error('Error processing expired waitlist entries:', error);
  }
}
