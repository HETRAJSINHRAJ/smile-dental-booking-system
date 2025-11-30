import { Timestamp } from 'firebase/firestore';

// User Roles
export type UserRole = 'patient' | 'admin' | 'staff' | 'dentist';

// Profile
export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

// Provider
export interface Provider {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  qualifications: string[];
  experienceYears: number;
  photoUrl: string;
  email: string;
  phone: string;
  isActive: boolean;
  displayOrder: number;
  rating: number;
  averageRating?: number;
  totalReviews: number;
  ratingDistribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Service
export interface Service {
  id: string;
  name: string;
  description: string;
  category: 'general' | 'cosmetic' | 'restorative' | 'orthodontics' | 'emergency';
  durationMinutes: number;
  price: number;
  isActive: boolean;
  requiresConsultation: boolean;
  iconName: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Appointment
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface RescheduleHistoryEntry {
  from: {
    date: Date;
    startTime: string;
    endTime: string;
  };
  to: {
    date: Date;
    startTime: string;
    endTime: string;
  };
  reason?: string;
  rescheduledBy: string; // userId
  rescheduledByRole: 'patient' | 'admin';
  rescheduledAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  providerId: string;
  providerName: string;
  providerImageUrl?: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  adminNotes?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  
  // Rescheduling fields
  rescheduleCount: number;
  rescheduleHistory?: RescheduleHistoryEntry[];
  maxReschedules: number; // Default: 2
  
  reminderSent: boolean;
  confirmationSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Contact Inquiry
export type InquiryStatus = 'new' | 'in_progress' | 'resolved';

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  respondedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Notification
export type NotificationType = 'appointment' | 'reminder' | 'cancellation' | 'general';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedAppointmentId?: string;
  actionUrl?: string;
  createdAt: Date;
}

// Provider Schedule
export interface ProviderSchedule {
  dayOfWeek: number; // 0-6
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

// Time Block
export interface TimeBlock {
  id: string;
  providerId: string;
  blockDate: Date;
  startTime: string;
  endTime: string;
  reason: string;
  createdAt: Date;
}

// Review
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  providerId: string;
  providerName: string;
  appointmentId: string;
  rating: number; // 1-5
  comment: string;
  response?: string;
  respondedBy?: string;
  respondedAt?: Timestamp;
  status: ReviewStatus;
  helpful: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
