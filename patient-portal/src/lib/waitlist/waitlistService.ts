/**
 * Waitlist Service
 * 
 * Handles waitlist operations for the patient portal
 */

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Waitlist, WaitlistStatus } from '@/types/shared';

/**
 * Join the waitlist for a specific provider, service, and date/time
 */
export async function joinWaitlist(data: {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceName: string;
  preferredDate: Date;
  preferredTime: string;
}): Promise<string> {
  try {
    const waitlistEntry: any = {
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      providerId: data.providerId,
      providerName: data.providerName,
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      preferredDate: Timestamp.fromDate(data.preferredDate),
      preferredTime: data.preferredTime,
      status: 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Only add userPhone if it's provided
    if (data.userPhone) {
      waitlistEntry.userPhone = data.userPhone;
    }

    const docRef = await addDoc(collection(db, 'waitlist'), waitlistEntry);
    return docRef.id;
  } catch (error) {
    console.error('Error joining waitlist:', error);
    throw new Error('Failed to join waitlist');
  }
}

/**
 * Get all waitlist entries for a user
 */
export async function getUserWaitlistEntries(userId: string): Promise<Waitlist[]> {
  try {
    const q = query(
      collection(db, 'waitlist'),
      where('userId', '==', userId),
      where('status', 'in', ['active', 'notified'])
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Waitlist[];
  } catch (error) {
    console.error('Error fetching user waitlist entries:', error);
    throw new Error('Failed to fetch waitlist entries');
  }
}

/**
 * Check if user is already on waitlist for specific provider/service/date
 */
export async function isUserOnWaitlist(
  userId: string,
  providerId: string,
  serviceId: string,
  preferredDate: Date
): Promise<boolean> {
  try {
    const dateStart = new Date(preferredDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(preferredDate);
    dateEnd.setHours(23, 59, 59, 999);

    // Simplified query to avoid complex index requirement
    // Filter by userId and status first, then filter in memory
    const q = query(
      collection(db, 'waitlist'),
      where('userId', '==', userId),
      where('status', 'in', ['active', 'notified'])
    );

    const snapshot = await getDocs(q);
    
    // Filter results in memory for provider, service, and date
    const matches = snapshot.docs.filter((doc) => {
      const data = doc.data();
      const entryDate = data.preferredDate.toDate();
      return (
        data.providerId === providerId &&
        data.serviceId === serviceId &&
        entryDate >= dateStart &&
        entryDate <= dateEnd
      );
    });

    return matches.length > 0;
  } catch (error) {
    console.error('Error checking waitlist status:', error);
    return false;
  }
}

/**
 * Cancel a waitlist entry
 */
export async function cancelWaitlistEntry(
  waitlistId: string,
  reason?: string
): Promise<void> {
  try {
    const waitlistRef = doc(db, 'waitlist', waitlistId);
    await updateDoc(waitlistRef, {
      status: 'cancelled',
      cancellationReason: reason || 'Cancelled by user',
      cancelledAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error cancelling waitlist entry:', error);
    throw new Error('Failed to cancel waitlist entry');
  }
}

/**
 * Delete a waitlist entry
 */
export async function deleteWaitlistEntry(waitlistId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'waitlist', waitlistId));
  } catch (error) {
    console.error('Error deleting waitlist entry:', error);
    throw new Error('Failed to delete waitlist entry');
  }
}

/**
 * Update waitlist entry status
 */
export async function updateWaitlistStatus(
  waitlistId: string,
  status: WaitlistStatus,
  additionalData?: Partial<Waitlist>
): Promise<void> {
  try {
    const waitlistRef = doc(db, 'waitlist', waitlistId);
    await updateDoc(waitlistRef, {
      status,
      updatedAt: Timestamp.now(),
      ...additionalData,
    });
  } catch (error) {
    console.error('Error updating waitlist status:', error);
    throw new Error('Failed to update waitlist status');
  }
}
