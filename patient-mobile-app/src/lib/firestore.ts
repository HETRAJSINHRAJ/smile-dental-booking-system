import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

/**
 * Generic function to create a document in Firestore
 */
export async function createDocument<T extends { id?: string; createdAt?: unknown; updatedAt?: unknown }>(
  collectionName: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const docRef = await firestore().collection(collectionName).add({
      ...data,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to get a document from Firestore
 */
export async function getDocument<T>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  try {
    const doc = await firestore().collection(collectionName).doc(docId).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to update a document in Firestore
 */
export async function updateDocument<T>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> {
  try {
    await firestore()
      .collection(collectionName)
      .doc(docId)
      .update({
        ...data,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to delete a document from Firestore
 */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    await firestore().collection(collectionName).doc(docId).delete();
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generic function to get all documents from a collection
 */
export async function getAllDocuments<T>(
  collectionName: string,
  constraints: Array<{ field: string; operator: FirebaseFirestoreTypes.WhereFilterOp; value: any }> = []
): Promise<T[]> {
  try {
    let query: FirebaseFirestoreTypes.Query = firestore().collection(collectionName);

    constraints.forEach(({ field, operator, value }) => {
      query = query.where(field, operator, value);
    });

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Generate a unique confirmation number
 */
export function generateConfirmationNumber(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${timestamp}-${randomStr}`;
}

/**
 * Check provider availability for a specific date and time
 */
export async function checkProviderAvailability(
  providerId: string,
  date: Date,
  startTime: string,
  duration: number
): Promise<boolean> {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await firestore()
      .collection('appointments')
      .where('providerId', '==', providerId)
      .where('appointmentDate', '>=', firestore.Timestamp.fromDate(startOfDay))
      .where('appointmentDate', '<=', firestore.Timestamp.fromDate(endOfDay))
      .where('status', 'in', ['pending', 'confirmed'])
      .get();

    const [hours, minutes] = startTime.split(':').map(Number);
    const requestedStart = hours * 60 + minutes;
    const requestedEnd = requestedStart + duration;

    for (const doc of appointments.docs) {
      const appointment = doc.data();
      const [appHours, appMinutes] = appointment.startTime.split(':').map(Number);
      const appointmentStart = appHours * 60 + appMinutes;
      const appointmentEnd = appointmentStart + (appointment.duration || 30);

      if (
        (requestedStart >= appointmentStart && requestedStart < appointmentEnd) ||
        (requestedEnd > appointmentStart && requestedEnd <= appointmentEnd) ||
        (requestedStart <= appointmentStart && requestedEnd >= appointmentEnd)
      ) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error checking provider availability:', error);
    throw error;
  }
}

/**
 * Get available time slots for a provider on a specific date
 */
export async function getAvailableTimeSlots(
  providerId: string,
  date: Date,
  duration: number
): Promise<string[]> {
  try {
    const dayOfWeek = date.getDay();
    const scheduleSnapshot = await firestore()
      .collection('providerSchedules')
      .where('providerId', '==', providerId)
      .where('dayOfWeek', '==', dayOfWeek)
      .where('isAvailable', '==', true)
      .get();

    if (scheduleSnapshot.empty) {
      return [];
    }

    const schedule = scheduleSnapshot.docs[0].data();
    const slots: string[] = [];
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    while (currentMinutes + duration <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      const timeSlot = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      const isAvailable = await checkProviderAvailability(providerId, date, timeSlot, duration);
      if (isAvailable) {
        slots.push(timeSlot);
      }

      currentMinutes += 30; // 30-minute intervals
    }

    return slots;
  } catch (error) {
    console.error('Error getting available time slots:', error);
    throw error;
  }
}
