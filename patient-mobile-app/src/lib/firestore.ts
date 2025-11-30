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
      
      // Use endTime if available, otherwise calculate from duration
      let appointmentEnd: number;
      if (appointment.endTime) {
        const [appEndHours, appEndMinutes] = appointment.endTime.split(':').map(Number);
        appointmentEnd = appEndHours * 60 + appEndMinutes;
      } else {
        appointmentEnd = appointmentStart + (appointment.duration || 30);
      }

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
      .collection('provider_schedules')
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

      // Skip break time if defined
      if (schedule.breakStartTime && schedule.breakEndTime) {
        const [breakStartHour, breakStartMinute] = schedule.breakStartTime.split(':').map(Number);
        const [breakEndHour, breakEndMinute] = schedule.breakEndTime.split(':').map(Number);
        const breakStart = breakStartHour * 60 + breakStartMinute;
        const breakEnd = breakEndHour * 60 + breakEndMinute;
        
        // Skip slots that fall within break time
        if (!(currentMinutes >= breakStart && currentMinutes < breakEnd)) {
          const isAvailable = await checkProviderAvailability(providerId, date, timeSlot, duration);
          if (isAvailable) {
            slots.push(timeSlot);
          }
        }
      } else {
        const isAvailable = await checkProviderAvailability(providerId, date, timeSlot, duration);
        if (isAvailable) {
          slots.push(timeSlot);
        }
      }

      currentMinutes += 30; // 30-minute intervals
    }

    return slots;
  } catch (error) {
    console.error('Error getting available time slots:', error);
    throw error;
  }
}

// Import cache utilities
import {
  firebaseCache,
  CACHE_KEYS,
  getCachedProviders,
  setCachedProviders,
  getCachedServices,
  setCachedServices,
  invalidateProviderCache,
  invalidateServiceCache,
  invalidateAllCache,
} from './cache';

// Types for services and providers
interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  imageUrl?: string;
  isActive?: boolean;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
  updatedAt?: FirebaseFirestoreTypes.Timestamp;
}

interface Provider {
  id: string;
  name: string;
  specialty?: string;
  bio?: string;
  imageUrl?: string;
  serviceIds?: string[];
  averageRating?: number;
  totalReviews?: number;
  isActive?: boolean;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
  updatedAt?: FirebaseFirestoreTypes.Timestamp;
}

/**
 * Get all services with caching (5-minute TTL)
 */
export async function getServices(): Promise<Service[]> {
  // Check cache first
  const cached = getCachedServices<Service[]>();
  if (cached) {
    return cached;
  }

  // Fetch from Firestore
  const snapshot = await firestore()
    .collection('services')
    .orderBy('name', 'asc')
    .get();

  const services = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Service[];

  // Cache the result
  setCachedServices(services);

  return services;
}

/**
 * Get a single service by ID with caching
 */
export async function getService(id: string): Promise<Service | null> {
  // Check cache first
  const cacheKey = CACHE_KEYS.SERVICE(id);
  const cached = firebaseCache.get<Service>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from Firestore
  const doc = await firestore().collection('services').doc(id).get();
  
  if (!doc.exists) {
    return null;
  }

  const service = { id: doc.id, ...doc.data() } as Service;

  // Cache the result
  firebaseCache.set(cacheKey, service);

  return service;
}

/**
 * Get all providers with caching (5-minute TTL)
 */
export async function getProviders(): Promise<Provider[]> {
  // Check cache first
  const cached = getCachedProviders<Provider[]>();
  if (cached) {
    return cached;
  }

  // Fetch from Firestore
  const snapshot = await firestore()
    .collection('providers')
    .orderBy('name', 'asc')
    .get();

  const providers = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Provider[];

  // Cache the result
  setCachedProviders(providers);

  return providers;
}

/**
 * Get a single provider by ID with caching
 */
export async function getProvider(id: string): Promise<Provider | null> {
  // Check cache first
  const cacheKey = CACHE_KEYS.PROVIDER(id);
  const cached = firebaseCache.get<Provider>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from Firestore
  const doc = await firestore().collection('providers').doc(id).get();
  
  if (!doc.exists) {
    return null;
  }

  const provider = { id: doc.id, ...doc.data() } as Provider;

  // Cache the result
  firebaseCache.set(cacheKey, provider);

  return provider;
}

/**
 * Get providers by service ID
 */
export async function getProvidersByService(serviceId: string): Promise<Provider[]> {
  const snapshot = await firestore()
    .collection('providers')
    .where('serviceIds', 'array-contains', serviceId)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Provider[];
}

// Export cache utilities for manual cache management
export {
  firebaseCache,
  invalidateProviderCache,
  invalidateServiceCache,
  invalidateAllCache,
};
