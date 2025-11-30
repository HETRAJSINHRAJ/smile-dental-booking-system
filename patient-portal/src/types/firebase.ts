import { Timestamp } from 'firebase/firestore';

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: string;
  imageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Provider {
  id: string;
  name: string;
  title: string; // e.g., "DDS", "DMD"
  specialty: string;
  bio: string;
  imageUrl: string;
  email: string;
  phone: string;
  yearsOfExperience: number;
  serviceIds: string[]; // services this provider offers
  
  // Enhanced fields for production-ready profiles
  rating?: number; // Average rating (0-5)
  totalReviews?: number; // Total number of reviews
  education?: string[]; // e.g., ["Harvard School of Dental Medicine", "UCLA"]
  certifications?: string[]; // e.g., ["Board Certified Orthodontist"]
  languages?: string[]; // e.g., ["English", "Spanish", "French"]
  specializations?: string[]; // Detailed specializations
  acceptingNewPatients?: boolean;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProviderSchedule {
  id: string;
  providerId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:mm format (e.g., "09:00")
  endTime: string; // HH:mm format (e.g., "17:00")
  breakStartTime?: string;
  breakEndTime?: string;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  providerImageUrl?: string;
  appointmentDate: Timestamp;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes?: string;
  confirmationNumber?: string;
  receiptId?: string;
  receiptUrl?: string; // Uploadcare URL for the receipt PDF
  receiptGenerated?: boolean;
  receiptGeneratedAt?: Timestamp;
  
  // Payment fields for appointment reservation system
  paymentStatus: 'pending' | 'reservation_paid' | 'fully_paid' | 'refunded';
  paymentAmount: number; // Amount paid online (reservation fee)
  paymentTransactionId?: string;
  paymentType: 'appointment_reservation' | 'full_payment' | 'service_payment';
  paymentDate?: Timestamp;
  paymentMethod?: string;
  
  // Service payment fields (collected at clinic)
  servicePaymentStatus: 'pending' | 'paid' | 'waived';
  servicePaymentAmount: number; // Service fee to be collected at clinic
  servicePaymentDate?: Timestamp;
  servicePaymentMethod?: 'cash' | 'card' | 'upi' | 'other';
  servicePaymentTransactionId?: string;
  servicePaymentNotes?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in-progress' | 'resolved';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BookingData {
  service?: Service;
  provider?: Provider;
  date?: Date;
  time?: string;
  notes?: string;
}

export interface NotificationPreferences {
  userId: string;
  email: {
    enabled: boolean;
    appointmentReminders: boolean;
    appointmentUpdates: boolean;
    paymentUpdates: boolean;
    promotional: boolean;
  };
  sms: {
    enabled: boolean;
    appointmentReminders: boolean;
    appointmentUpdates: boolean;
    paymentUpdates: boolean;
  };
  push: {
    enabled: boolean;
    appointmentReminders: boolean;
    appointmentUpdates: boolean;
    paymentUpdates: boolean;
    promotional: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format (e.g., "22:00")
    end: string; // HH:mm format (e.g., "08:00")
    timezone: string;
  };
  language: 'en' | 'hi';
  updatedAt: Timestamp;
}

export interface UserProfile {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: Timestamp;
  gender?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalHistory?: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    notes: string;
  };
  avatarUrl?: string;
  preferences?: NotificationPreferences;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}