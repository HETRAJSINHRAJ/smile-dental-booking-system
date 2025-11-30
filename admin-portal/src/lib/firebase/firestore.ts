import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  WhereFilterOp,
  QueryConstraint,
  limit as firestoreLimit,
  startAfter,
  endBefore,
  limitToLast,
  DocumentSnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './config';
import type { Service, Provider, ProviderSchedule, Appointment, ContactInquiry } from '@/types/shared';
import {
  firebaseCache,
  CACHE_KEYS,
  getCachedProviders,
  setCachedProviders,
  getCachedServices,
  setCachedServices,
  invalidateProviderCache,
  invalidateServiceCache
} from './cache';

// Pagination types
export interface PaginatedResult<T> {
  items: T[];
  hasMore: boolean;
  hasPrevious: boolean;
  firstDoc: DocumentSnapshot | null;
  lastDoc: DocumentSnapshot | null;
  total?: number;
}

export interface PaginationOptions {
  pageSize?: number;
  startAfterDoc?: DocumentSnapshot | null;
  endBeforeDoc?: DocumentSnapshot | null;
}

const DEFAULT_PAGE_SIZE = 20;

// Generic Firestore operations
export async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching document from ${collectionName}:`, error);
    throw error;
  }
}

export async function getAllDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  } catch (error) {
    console.error(`Error fetching documents from ${collectionName}:`, error);
    throw error;
  }
}

export async function createDocument<T>(collectionName: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
}

export async function updateDocument<T>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
}

export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
}

// Service-specific operations with caching
export const getServices = async (): Promise<Service[]> => {
  // Check cache first
  const cached = getCachedServices<Service[]>();
  if (cached) {
    return cached;
  }
  
  // Fetch from Firestore
  const services = await getAllDocuments<Service>('services', [orderBy('name', 'asc')]);
  
  // Cache the result
  setCachedServices(services);
  
  return services;
};

export const getService = async (id: string): Promise<Service | null> => {
  // Check cache first
  const cacheKey = CACHE_KEYS.SERVICE(id);
  const cached = firebaseCache.get<Service>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fetch from Firestore
  const service = await getDocument<Service>('services', id);
  
  // Cache the result if found
  if (service) {
    firebaseCache.set(cacheKey, service);
  }
  
  return service;
};

export const createService = async (data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const id = await createDocument<Service>('services', data);
  // Invalidate services cache
  invalidateServiceCache();
  return id;
};

export const updateService = async (id: string, data: Partial<Service>): Promise<void> => {
  await updateDocument<Service>('services', id, data);
  // Invalidate services cache
  invalidateServiceCache();
};

export const deleteService = async (id: string): Promise<void> => {
  await deleteDocument('services', id);
  // Invalidate services cache
  invalidateServiceCache();
};

// Provider-specific operations with caching
export const getProviders = async (): Promise<Provider[]> => {
  // Check cache first
  const cached = getCachedProviders<Provider[]>();
  if (cached) {
    return cached;
  }
  
  // Fetch from Firestore
  const providers = await getAllDocuments<Provider>('providers', [orderBy('name', 'asc')]);
  
  // Cache the result
  setCachedProviders(providers);
  
  return providers;
};

export const getProvider = async (id: string): Promise<Provider | null> => {
  // Check cache first
  const cacheKey = CACHE_KEYS.PROVIDER(id);
  const cached = firebaseCache.get<Provider>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fetch from Firestore
  const provider = await getDocument<Provider>('providers', id);
  
  // Cache the result if found
  if (provider) {
    firebaseCache.set(cacheKey, provider);
  }
  
  return provider;
};

export const getProvidersByService = (serviceId: string) => 
  getAllDocuments<Provider>('providers', [where('serviceIds', 'array-contains', serviceId)]);

export const createProvider = async (data: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const id = await createDocument<Provider>('providers', data);
  // Invalidate providers cache
  invalidateProviderCache();
  return id;
};

export const updateProvider = async (id: string, data: Partial<Provider>): Promise<void> => {
  await updateDocument<Provider>('providers', id, data);
  // Invalidate providers cache
  invalidateProviderCache();
};

export const deleteProvider = async (id: string): Promise<void> => {
  await deleteDocument('providers', id);
  // Invalidate providers cache
  invalidateProviderCache();
};

// Provider Schedule operations
export const getProviderSchedule = (providerId: string) => 
  getAllDocuments<ProviderSchedule>('provider_schedules', [
    where('providerId', '==', providerId),
    where('isAvailable', '==', true)
  ]);
export const createProviderSchedule = (data: Omit<ProviderSchedule, 'id'>) => 
  createDocument<ProviderSchedule>('provider_schedules', data);
export const updateProviderSchedule = (id: string, data: Partial<ProviderSchedule>) => 
  updateDocument<ProviderSchedule>('provider_schedules', id, data);
export const deleteProviderSchedule = (id: string) => deleteDocument('provider_schedules', id);

// Appointment-specific operations
export const getAppointments = (userId?: string) => {
  const constraints: QueryConstraint[] = [orderBy('appointmentDate', 'desc')];
  if (userId) {
    constraints.unshift(where('userId', '==', userId));
  }
  return getAllDocuments<Appointment>('appointments', constraints);
};

/**
 * Get paginated appointments with cursor-based pagination
 * Uses startAfter/endBefore for efficient Firestore pagination
 */
export const getAppointmentsPaginated = async (
  options: PaginationOptions & {
    userId?: string;
    status?: string;
  } = {}
): Promise<PaginatedResult<Appointment>> => {
  const { 
    pageSize = DEFAULT_PAGE_SIZE, 
    startAfterDoc, 
    endBeforeDoc,
    userId,
    status 
  } = options;

  try {
    const collectionRef = collection(db, 'appointments');
    const constraints: QueryConstraint[] = [];

    // Add filters
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    if (status && status !== 'all') {
      constraints.push(where('status', '==', status));
    }

    // Add ordering
    constraints.push(orderBy('appointmentDate', 'desc'));

    // Add pagination
    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
      constraints.push(firestoreLimit(pageSize + 1)); // +1 to check if there are more
    } else if (endBeforeDoc) {
      constraints.push(endBefore(endBeforeDoc));
      constraints.push(limitToLast(pageSize + 1)); // +1 to check if there are previous
    } else {
      constraints.push(firestoreLimit(pageSize + 1)); // +1 to check if there are more
    }

    const q = query(collectionRef, ...constraints);
    const snapshot = await getDocs(q);

    const docs = snapshot.docs;
    let items: Appointment[];
    let hasMore = false;
    let hasPrevious = false;

    if (startAfterDoc) {
      // Forward pagination
      hasMore = docs.length > pageSize;
      hasPrevious = true;
      items = docs.slice(0, pageSize).map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
    } else if (endBeforeDoc) {
      // Backward pagination
      hasPrevious = docs.length > pageSize;
      hasMore = true;
      items = docs.slice(hasPrevious ? 1 : 0).map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
    } else {
      // Initial load
      hasMore = docs.length > pageSize;
      hasPrevious = false;
      items = docs.slice(0, pageSize).map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
    }

    return {
      items,
      hasMore,
      hasPrevious,
      firstDoc: docs.length > 0 ? docs[0] : null,
      lastDoc: docs.length > 0 ? docs[Math.min(docs.length - 1, pageSize - 1)] : null,
    };
  } catch (error) {
    console.error('Error fetching paginated appointments:', error);
    throw error;
  }
};

export const getAppointment = (id: string) => getDocument<Appointment>('appointments', id);

export const getProviderAppointments = (providerId: string, date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return getAllDocuments<Appointment>('appointments', [
    where('providerId', '==', providerId),
    where('appointmentDate', '>=', Timestamp.fromDate(startOfDay)),
    where('appointmentDate', '<=', Timestamp.fromDate(endOfDay)),
    where('status', 'in', ['pending', 'confirmed'])
  ]);
};

export const createAppointment = (data: Omit<Appointment, 'id'>) => 
  createDocument<Appointment>('appointments', data);

export const updateAppointment = (id: string, data: Partial<Appointment>) => 
  updateDocument<Appointment>('appointments', id, data);

export const deleteAppointment = (id: string) => deleteDocument('appointments', id);

// Contact inquiry operations
export const getContactInquiries = () => 
  getAllDocuments<ContactInquiry>('contact_inquiries', [orderBy('createdAt', 'desc')]);
export const getContactInquiry = (id: string) => 
  getDocument<ContactInquiry>('contact_inquiries', id);
export const createContactInquiry = (data: Omit<ContactInquiry, 'id'>) => 
  createDocument<ContactInquiry>('contact_inquiries', data);
export const updateContactInquiry = (id: string, data: Partial<ContactInquiry>) => 
  updateDocument<ContactInquiry>('contact_inquiries', id, data);
export const deleteContactInquiry = (id: string) => deleteDocument('contact_inquiries', id);

// Helper function to check provider availability
export async function checkProviderAvailability(
  providerId: string,
  date: Date,
  startTime: string,
  duration: number
): Promise<boolean> {
  const appointments = await getProviderAppointments(providerId, date);

  // Validate startTime parameter
  if (!startTime || typeof startTime !== 'string') {
    console.error('Invalid startTime parameter:', startTime);
    return false;
  }

  // Convert time string to minutes for comparison
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const requestedStart = startHour * 60 + startMinute;
  const requestedEnd = requestedStart + duration;

  // Check for conflicts with existing appointments
  for (const apt of appointments) {
    // Skip appointments without valid time fields
    if (!apt.startTime || !apt.endTime) {
      console.warn('Appointment missing time fields:', apt.id);
      continue;
    }

    const [aptStartHour, aptStartMinute] = apt.startTime.split(':').map(Number);
    const [aptEndHour, aptEndMinute] = apt.endTime.split(':').map(Number);
    const aptStart = aptStartHour * 60 + aptStartMinute;
    const aptEnd = aptEndHour * 60 + aptEndMinute;

    // Check for overlap
    if (
      (requestedStart >= aptStart && requestedStart < aptEnd) ||
      (requestedEnd > aptStart && requestedEnd <= aptEnd) ||
      (requestedStart <= aptStart && requestedEnd >= aptEnd)
    ) {
      return false;
    }
  }
  
  return true;
}

// Generate available time slots for a provider on a specific date
export async function getAvailableTimeSlots(
  providerId: string,
  date: Date,
  duration: number
): Promise<string[]> {
  const schedule = await getProviderSchedule(providerId);
  const dayOfWeek = date.getDay();
  const daySchedule = schedule.find(s => s.dayOfWeek === dayOfWeek);
  
  if (!daySchedule) {
    return [];
  }
  
  const slots: string[] = [];
  const [startHour, startMinute] = daySchedule.startTime.split(':').map(Number);
  const [endHour, endMinute] = daySchedule.endTime.split(':').map(Number);
  
  let currentMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  while (currentMinutes + duration <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    const timeSlot = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Skip break time if defined
    if (daySchedule.breakStartTime && daySchedule.breakEndTime) {
      const [breakStartHour, breakStartMinute] = daySchedule.breakStartTime.split(':').map(Number);
      const [breakEndHour, breakEndMinute] = daySchedule.breakEndTime.split(':').map(Number);
      const breakStart = breakStartHour * 60 + breakStartMinute;
      const breakEnd = breakEndHour * 60 + breakEndMinute;
      
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
}

// User/Patient operations with pagination
import type { UserProfile, AuditLog } from '@/types/shared';

/**
 * Get paginated users/patients with cursor-based pagination
 */
export const getUsersPaginated = async (
  options: PaginationOptions = {}
): Promise<PaginatedResult<UserProfile>> => {
  const { 
    pageSize = DEFAULT_PAGE_SIZE, 
    startAfterDoc, 
    endBeforeDoc 
  } = options;

  try {
    const collectionRef = collection(db, 'users');
    const constraints: QueryConstraint[] = [];

    // Add ordering by creation date (most recent first)
    constraints.push(orderBy('createdAt', 'desc'));

    // Add pagination
    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
      constraints.push(firestoreLimit(pageSize + 1));
    } else if (endBeforeDoc) {
      constraints.push(endBefore(endBeforeDoc));
      constraints.push(limitToLast(pageSize + 1));
    } else {
      constraints.push(firestoreLimit(pageSize + 1));
    }

    const q = query(collectionRef, ...constraints);
    const snapshot = await getDocs(q);

    const docs = snapshot.docs;
    let items: UserProfile[];
    let hasMore = false;
    let hasPrevious = false;

    if (startAfterDoc) {
      hasMore = docs.length > pageSize;
      hasPrevious = true;
      items = docs.slice(0, pageSize).map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserProfile[];
    } else if (endBeforeDoc) {
      hasPrevious = docs.length > pageSize;
      hasMore = true;
      items = docs.slice(hasPrevious ? 1 : 0).map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserProfile[];
    } else {
      hasMore = docs.length > pageSize;
      hasPrevious = false;
      items = docs.slice(0, pageSize).map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserProfile[];
    }

    return {
      items,
      hasMore,
      hasPrevious,
      firstDoc: docs.length > 0 ? docs[0] : null,
      lastDoc: docs.length > 0 ? docs[Math.min(docs.length - 1, pageSize - 1)] : null,
    };
  } catch (error) {
    console.error('Error fetching paginated users:', error);
    throw error;
  }
};

/**
 * Get paginated audit logs with cursor-based pagination
 */
export const getAuditLogsPaginated = async (
  options: PaginationOptions & {
    userId?: string;
    action?: string;
    resource?: string;
  } = {}
): Promise<PaginatedResult<AuditLog>> => {
  const { 
    pageSize = DEFAULT_PAGE_SIZE, 
    startAfterDoc, 
    endBeforeDoc,
    userId,
    action,
    resource
  } = options;

  try {
    const collectionRef = collection(db, 'auditLogs');
    const constraints: QueryConstraint[] = [];

    // Add filters - Note: Firestore requires indexes for compound queries
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    if (action && action !== 'all') {
      constraints.push(where('action', '==', action));
    }
    if (resource && resource !== 'all') {
      constraints.push(where('resource', '==', resource));
    }

    // Add ordering
    constraints.push(orderBy('timestamp', 'desc'));

    // Add pagination
    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
      constraints.push(firestoreLimit(pageSize + 1));
    } else if (endBeforeDoc) {
      constraints.push(endBefore(endBeforeDoc));
      constraints.push(limitToLast(pageSize + 1));
    } else {
      constraints.push(firestoreLimit(pageSize + 1));
    }

    const q = query(collectionRef, ...constraints);
    const snapshot = await getDocs(q);

    const docs = snapshot.docs;
    let items: AuditLog[];
    let hasMore = false;
    let hasPrevious = false;

    if (startAfterDoc) {
      hasMore = docs.length > pageSize;
      hasPrevious = true;
      items = docs.slice(0, pageSize).map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLog[];
    } else if (endBeforeDoc) {
      hasPrevious = docs.length > pageSize;
      hasMore = true;
      items = docs.slice(hasPrevious ? 1 : 0).map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLog[];
    } else {
      hasMore = docs.length > pageSize;
      hasPrevious = false;
      items = docs.slice(0, pageSize).map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLog[];
    }

    return {
      items,
      hasMore,
      hasPrevious,
      firstDoc: docs.length > 0 ? docs[0] : null,
      lastDoc: docs.length > 0 ? docs[Math.min(docs.length - 1, pageSize - 1)] : null,
    };
  } catch (error) {
    console.error('Error fetching paginated audit logs:', error);
    throw error;
  }
};

// Export cache utilities for manual cache management
export { 
  firebaseCache, 
  invalidateProviderCache, 
  invalidateServiceCache,
  invalidateAllCache 
} from './cache';
