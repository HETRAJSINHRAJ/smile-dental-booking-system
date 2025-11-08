import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

type Timestamp = FirebaseFirestoreTypes.Timestamp;

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
  title: string;
  specialty: string;
  bio: string;
  imageUrl: string;
  email: string;
  phone: string;
  yearsOfExperience: number;
  serviceIds: string[];
  rating?: number;
  totalReviews?: number;
  education?: string[];
  certifications?: string[];
  languages?: string[];
  specializations?: string[];
  acceptingNewPatients?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProviderSchedule {
  id: string;
  providerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
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
  appointmentDate: Timestamp;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  confirmationNumber?: string;
  paymentStatus: 'pending' | 'reservation_paid' | 'fully_paid' | 'refunded';
  paymentAmount: number;
  paymentTransactionId?: string;
  paymentType: 'appointment_reservation' | 'full_payment' | 'service_payment';
  paymentDate?: Timestamp;
  paymentMethod?: string;
  servicePaymentStatus: 'pending' | 'paid' | 'waived';
  servicePaymentAmount: number;
  servicePaymentDate?: Timestamp;
  servicePaymentMethod?: 'cash' | 'card' | 'upi' | 'other';
  servicePaymentTransactionId?: string;
  servicePaymentNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserProfile {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'patient' | 'admin';
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
