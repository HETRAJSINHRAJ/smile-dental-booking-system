/**
 * Zod Validation Schemas for Patient Portal
 * 
 * Comprehensive validation schemas for all form inputs and API requests.
 * These schemas are used for both client-side and server-side validation.
 */

import { z } from 'zod';

// ============================================================================
// Common Validators
// ============================================================================

/**
 * Indian phone number validation
 * Supports formats: 10-digit, +91 prefix, with spaces/dashes
 */
export const indianPhoneSchema = z.string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number is too long')
  .refine((val) => {
    const cleaned = val.replace(/[^\d+]/g, '');
    const tenDigit = cleaned.replace(/^\+91/, '');
    return /^[6-9]\d{9}$/.test(tenDigit);
  }, 'Please enter a valid Indian mobile number');

/**
 * Email validation with additional security checks
 */
export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .max(254, 'Email address is too long')
  .transform((val) => val.toLowerCase().trim());

/**
 * Password validation with security requirements
 */
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .refine((val) => /[A-Z]/.test(val), 'Password must contain at least one uppercase letter')
  .refine((val) => /[a-z]/.test(val), 'Password must contain at least one lowercase letter')
  .refine((val) => /[0-9]/.test(val), 'Password must contain at least one number');

/**
 * Simple password for login (less strict)
 */
export const loginPasswordSchema = z.string()
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password is too long');

/**
 * Name validation (Indian names support)
 */
export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s\-'.]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .transform((val) => val.trim());

/**
 * Indian PIN code validation
 */
export const pinCodeSchema = z.string()
  .length(6, 'PIN code must be exactly 6 digits')
  .regex(/^\d{6}$/, 'PIN code must contain only digits')
  .refine((val) => /^[1-9]/.test(val), 'Invalid PIN code');

// ============================================================================
// User Registration Schema
// ============================================================================

export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  fullName: nameSchema,
  phone: indianPhoneSchema.optional(),
  dateOfBirth: z.string().optional(),
  consent: z.object({
    privacyPolicy: z.boolean().refine((val) => val === true, 'You must accept the privacy policy'),
    termsOfService: z.boolean().refine((val) => val === true, 'You must accept the terms of service'),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;

// ============================================================================
// Login Schema
// ============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================================================
// Password Reset Schema
// ============================================================================

export const passwordResetSchema = z.object({
  email: emailSchema,
});

export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

// ============================================================================
// Profile Update Schema
// ============================================================================

export const profileUpdateSchema = z.object({
  fullName: nameSchema.optional(),
  phone: indianPhoneSchema.optional(),
  dateOfBirth: z.string().optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
  preferences: z.object({
    language: z.enum(['en', 'hi']).optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      push: z.boolean().optional(),
    }).optional(),
  }).optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// ============================================================================
// Appointment Booking Schema
// ============================================================================

export const appointmentBookingSchema = z.object({
  serviceId: z.string().min(1, 'Service is required'),
  serviceName: z.string().min(1, 'Service name is required'),
  providerId: z.string().min(1, 'Provider is required'),
  providerName: z.string().min(1, 'Provider name is required'),
  appointmentDate: z.string().min(1, 'Appointment date is required'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  patientName: nameSchema,
  patientEmail: emailSchema,
  patientPhone: indianPhoneSchema.optional(),
});

export type AppointmentBookingInput = z.infer<typeof appointmentBookingSchema>;

// ============================================================================
// Review Submission Schema
// ============================================================================

export const reviewSubmissionSchema = z.object({
  providerId: z.string().min(1, 'Provider is required'),
  appointmentId: z.string().min(1, 'Appointment is required'),
  rating: z.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z.string()
    .min(10, 'Review must be at least 10 characters')
    .max(1000, 'Review cannot exceed 1000 characters'),
});

export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;

// ============================================================================
// Payment Data Schema
// ============================================================================

export const paymentDataSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['INR']).default('INR'),
  paymentMethod: z.enum(['razorpay', 'stripe', 'payu']).optional(),
});

export type PaymentDataInput = z.infer<typeof paymentDataSchema>;

// ============================================================================
// Waitlist Schema
// ============================================================================

export const waitlistEntrySchema = z.object({
  providerId: z.string().min(1, 'Provider ID is required'),
  serviceId: z.string().min(1, 'Service ID is required'),
  preferredDate: z.string().min(1, 'Preferred date is required'),
  preferredTime: z.string().optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export type WaitlistEntryInput = z.infer<typeof waitlistEntrySchema>;

// ============================================================================
// Contact Form Schema
// ============================================================================

export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: indianPhoneSchema.optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(100, 'Subject is too long'),
  message: z.string().min(20, 'Message must be at least 20 characters').max(2000, 'Message is too long'),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// ============================================================================
// Reschedule Request Schema
// ============================================================================

export const rescheduleRequestSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  newDate: z.string().min(1, 'New date is required'),
  newStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  newEndTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  reason: z.string().max(500, 'Reason cannot exceed 500 characters').optional(),
});

export type RescheduleRequestInput = z.infer<typeof rescheduleRequestSchema>;

// ============================================================================
// GDPR Compliance Schemas
// ============================================================================

export const dataExportRequestSchema = z.object({
  email: emailSchema,
  requestReason: z.string().max(500, 'Reason is too long').optional(),
});

export type DataExportRequestInput = z.infer<typeof dataExportRequestSchema>;

export const accountDeletionRequestSchema = z.object({
  email: emailSchema,
  confirmEmail: emailSchema,
  reason: z.string().max(500, 'Reason is too long').optional(),
}).refine((data) => data.email === data.confirmEmail, {
  message: 'Email addresses do not match',
  path: ['confirmEmail'],
});

export type AccountDeletionRequestInput = z.infer<typeof accountDeletionRequestSchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validates data against a schema and returns typed result
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Formats Zod errors into a user-friendly object
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  }
  return errors;
}
