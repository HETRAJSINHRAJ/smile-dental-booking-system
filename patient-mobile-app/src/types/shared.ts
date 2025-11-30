/**
 * Shared Type Definitions for Production-Ready Dental Booking System
 * 
 * This file contains unified interfaces that should be consistent across:
 * - admin-portal
 * - patient-portal
 * - patient-mobile-app
 * 
 * These types align with the production-readiness requirements and design document.
 */

import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

type Timestamp = FirebaseFirestoreTypes.Timestamp;

// ============================================================================
// User and Authentication Types
// ============================================================================

export type UserRole = 'patient' | 'admin';

export interface NotificationPreferences {
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
    start: string; // "22:00"
    end: string;   // "08:00"
    timezone: string;
  };
  language: 'en' | 'hi';
}

export interface ConsentRecord {
  privacyPolicy: boolean;
  termsOfService: boolean;
  consentDate: Timestamp;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  dateOfBirth?: Timestamp;
  gender?: string;
  avatarUrl?: string;
  
  // Address information
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  
  // Insurance information
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  
  // Emergency contact
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  
  // Medical history
  medicalHistory?: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    notes: string;
  };
  
  // Preferences and consent
  preferences: NotificationPreferences;
  consent: ConsentRecord;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Provider Types
// ============================================================================

export interface ProviderRatingStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface Provider {
  id: string;
  name: string;
  title: string; // e.g., "DDS", "DMD", "BDS"
  specialty: string;
  specialization: string;
  bio: string;
  imageUrl: string;
  photoUrl: string; // Alias for imageUrl for backward compatibility
  email: string;
  phone: string;
  
  // Experience and qualifications
  yearsOfExperience: number;
  experienceYears: number; // Alias for backward compatibility
  education: string[];
  qualifications: string[]; // Alias for education
  certifications: string[];
  languages: string[];
  
  // Services and availability
  serviceIds: string[];
  isActive: boolean;
  acceptingNewPatients: boolean;
  
  // Ratings and reviews
  rating: number; // Average rating (0-5)
  averageRating?: number; // Alias for rating
  totalReviews: number;
  ratingDistribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  
  // Display settings
  displayOrder: number;
  
  // Metadata
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

// ============================================================================
// Service Types
// ============================================================================

export type ServiceCategory = 'general' | 'cosmetic' | 'restorative' | 'orthodontics' | 'emergency';

export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  duration: number; // in minutes
  durationMinutes: number; // Alias for duration
  price: number;
  imageUrl?: string;
  iconName?: string;
  isActive: boolean;
  requiresConsultation: boolean;
  displayOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Appointment Types
// ============================================================================

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type PaymentStatus = 'pending' | 'reservation_paid' | 'fully_paid' | 'refunded';
export type ServicePaymentStatus = 'pending' | 'paid' | 'waived';
export type PaymentType = 'appointment_reservation' | 'full_payment' | 'service_payment';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'razorpay' | 'other';

export interface RescheduleHistoryEntry {
  from: {
    date: Timestamp;
    startTime: string;
    endTime: string;
  };
  to: {
    date: Timestamp;
    startTime: string;
    endTime: string;
  };
  reason?: string;
  rescheduledBy: string; // userId
  rescheduledByRole: 'patient' | 'admin';
  rescheduledAt: Timestamp;
}

export interface Appointment {
  id: string;
  
  // Patient information
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  
  // Service and provider information
  serviceId: string;
  serviceName: string;
  serviceDuration?: number;
  providerId: string;
  providerName: string;
  providerImageUrl?: string;
  
  // Appointment timing
  appointmentDate: Timestamp;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  
  // Status and notes
  status: AppointmentStatus;
  notes?: string;
  adminNotes?: string;
  cancellationReason?: string;
  cancelledAt?: Timestamp;
  confirmationNumber?: string;
  
  // Receipt information
  receiptId?: string;
  receiptUrl?: string; // Uploadcare URL for the receipt PDF
  receiptGenerated?: boolean;
  receiptGeneratedAt?: Timestamp;
  
  // Payment information (reservation fee paid online)
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  paymentTransactionId?: string;
  paymentType: PaymentType;
  paymentDate?: Timestamp;
  paymentMethod?: string;
  paymentGatewayResponse?: any;
  
  // Service payment information (collected at clinic)
  servicePaymentStatus: ServicePaymentStatus;
  servicePaymentAmount: number;
  servicePaymentDate?: Timestamp;
  servicePaymentMethod?: PaymentMethod;
  servicePaymentTransactionId?: string;
  servicePaymentNotes?: string;
  
  // Rescheduling information
  rescheduleCount: number;
  rescheduleHistory?: RescheduleHistoryEntry[];
  maxReschedules: number; // Default: 2
  
  // Notification tracking
  reminderSent: boolean;
  confirmationSent: boolean;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Review Types
// ============================================================================

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
  
  // Admin response
  response?: string;
  respondedBy?: string;
  respondedAt?: Timestamp;
  
  // Status and moderation
  status: ReviewStatus;
  
  // Engagement metrics
  helpful: number; // Count of helpful votes
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Audit Log Types
// ============================================================================

export type AuditAction = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete'
  | 'login' 
  | 'logout' 
  | 'password_reset'
  | 'payment_initiated' 
  | 'payment_completed' 
  | 'payment_failed'
  | 'refund_initiated'
  | 'refund_completed'
  | 'appointment_confirmed' 
  | 'appointment_cancelled' 
  | 'appointment_rescheduled'
  | 'appointment_completed'
  | 'review_submitted'
  | 'review_approved'
  | 'review_rejected';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  action: AuditAction;
  resource: string; // 'appointment', 'patient', 'provider', 'service', etc.
  resourceId: string;
  
  // Change tracking
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  
  // Request metadata
  metadata: {
    ipAddress: string;
    userAgent: string;
    location?: string;
    sessionId?: string;
  };
  
  // Additional context
  description?: string;
  
  // Metadata
  timestamp: Timestamp;
  createdAt: Timestamp;
}

// ============================================================================
// Payment Audit Log Types
// ============================================================================

export type PaymentAuditAction = 
  | 'payment_initiated' 
  | 'payment_success' 
  | 'payment_failed' 
  | 'refund_initiated' 
  | 'refund_completed'
  | 'service_payment_recorded';

export interface PaymentAuditLog {
  id: string;
  
  // Appointment and patient information
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  
  // Service and provider information
  serviceName: string;
  providerName: string;
  
  // Payment details
  paymentType: 'appointment_reservation' | 'service_payment' | 'refund';
  action: PaymentAuditAction;
  amount: number;
  currency: string;
  paymentMethod?: string;
  transactionId?: string;
  
  // Gateway information
  gatewayResponse?: any;
  errorMessage?: string;
  errorCode?: string;
  
  // Request metadata
  ipAddress?: string;
  userAgent?: string;
  
  // Refund specific
  refundReason?: string;
  refundInitiatedBy?: string;
  
  // Metadata
  timestamp: Timestamp;
  createdAt: Timestamp;
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType = 
  | 'appointment_confirmed'
  | 'appointment_reminder'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  | 'payment_success'
  | 'payment_failed'
  | 'payment_receipt'
  | 'review_request'
  | 'general'
  | 'promotional';

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  channels: ('email' | 'sms' | 'push')[];
  scheduledFor?: Timestamp;
  priority: 'high' | 'normal' | 'low';
}

export interface NotificationLog {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  channel: 'email' | 'sms' | 'push';
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'read';
  
  // Delivery tracking
  sentAt?: Timestamp;
  deliveredAt?: Timestamp;
  readAt?: Timestamp;
  failedAt?: Timestamp;
  errorMessage?: string;
  
  // Related resources
  appointmentId?: string;
  
  // Metadata
  createdAt: Timestamp;
}

// ============================================================================
// Contact Inquiry Types
// ============================================================================

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
  response?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface AnalyticsEvent {
  name: string;
  category: 'booking' | 'payment' | 'user' | 'navigation' | 'engagement';
  properties: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: Timestamp;
}

export interface DashboardMetrics {
  period: 'today' | 'week' | 'month' | 'year' | 'custom';
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
  appointments: {
    total: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    noShow: number;
  };
  revenue: {
    total: number;
    reservationFees: number;
    servicePayments: number;
    refunds: number;
    net: number;
  };
  users: {
    total: number;
    new: number;
    active: number;
  };
  conversion: {
    serviceViews: number;
    providerViews: number;
    bookingStarted: number;
    bookingCompleted: number;
    conversionRate: number;
  };
}

// ============================================================================
// Utility Types
// ============================================================================

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  appointmentId?: string;
}

export interface DateAvailability {
  date: Date;
  isAvailable: boolean;
  slots: TimeSlot[];
}

export interface SearchFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'array-contains';
  value: any;
}

export interface PaginationParams {
  limit: number;
  offset: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}
