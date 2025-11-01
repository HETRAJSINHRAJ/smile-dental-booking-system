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
  limit as firestoreLimit
} from 'firebase/firestore';
import { db } from './config';
import type { Service, Provider, ProviderSchedule, Appointment, ContactInquiry, UserProfile } from '@/types/firebase';

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

export async function createDocument<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
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

// Service-specific operations
export const getServices = () => getAllDocuments<Service>('services', [orderBy('name', 'asc')]);
export const getService = (id: string) => getDocument<Service>('services', id);
export const createService = (data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => 
  createDocument<Service>('services', data);
export const updateService = (id: string, data: Partial<Service>) => 
  updateDocument<Service>('services', id, data);
export const deleteService = (id: string) => deleteDocument('services', id);

// Provider-specific operations
export const getProviders = () => getAllDocuments<Provider>('providers', [orderBy('name', 'asc')]);
export const getProvider = (id: string) => getDocument<Provider>('providers', id);
export const getProvidersByService = (serviceId: string) => 
  getAllDocuments<Provider>('providers', [where('serviceIds', 'array-contains', serviceId)]);
export const createProvider = (data: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => 
  createDocument<Provider>('providers', data);
export const updateProvider = (id: string, data: Partial<Provider>) => 
  updateDocument<Provider>('providers', id, data);
export const deleteProvider = (id: string) => deleteDocument('providers', id);

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

// Generate a unique confirmation number
function generateConfirmationNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const createAppointment = async (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'confirmationNumber'>) => {
  const confirmationNumber = generateConfirmationNumber();
  return createDocument<Appointment>('appointments', {
    ...data,
    confirmationNumber
  });
};

export const updateAppointment = (id: string, data: Partial<Appointment>) => 
  updateDocument<Appointment>('appointments', id, data);

export const deleteAppointment = (id: string) => deleteDocument('appointments', id);

// Contact inquiry operations
export const getContactInquiries = () => 
  getAllDocuments<ContactInquiry>('contact_inquiries', [orderBy('createdAt', 'desc')]);
export const getContactInquiry = (id: string) => 
  getDocument<ContactInquiry>('contact_inquiries', id);
export const createContactInquiry = (data: Omit<ContactInquiry, 'id' | 'createdAt' | 'updatedAt'>) => 
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

// User Profile operations
export const getUserProfile = (userId: string) => getDocument<UserProfile>('users', userId);

export const createUserProfile = async (userId: string, data: Omit<UserProfile, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      ...data,
      uid: userId,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserProfile = (userId: string, data: Partial<UserProfile>) =>
  updateDocument<UserProfile>('users', userId, data);
