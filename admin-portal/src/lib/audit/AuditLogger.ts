/**
 * AuditLogger Service
 * 
 * Provides comprehensive audit logging for all administrative actions
 * in compliance with HIPAA and GDPR requirements.
 * 
 * Features:
 * - Tracks all data access and modifications
 * - Captures user context (IP, user agent, session)
 * - Records before/after values for updates
 * - Immutable logs for compliance
 */

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AuditLog, AuditAction, UserRole } from '@/types/shared';

interface LogActionParams {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  action: AuditAction;
  resource: string;
  resourceId: string;
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export class AuditLogger {
  private static instance: AuditLogger;

  private constructor() {}

  /**
   * Get singleton instance of AuditLogger
   */
  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Log an action to the audit log
   */
  public async logAction(params: LogActionParams): Promise<void> {
    try {
      const auditLog: Omit<AuditLog, 'id'> = {
        userId: params.userId,
        userName: params.userName,
        userEmail: params.userEmail,
        userRole: params.userRole,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        changes: params.changes,
        metadata: {
          ipAddress: params.ipAddress || 'unknown',
          userAgent: params.userAgent || 'unknown',
          sessionId: params.sessionId,
        },
        description: params.description,
        timestamp: Timestamp.now(),
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'auditLogs'), auditLog);
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw error to prevent disrupting the main operation
      // But log to monitoring service (Sentry)
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(error, {
          tags: {
            component: 'AuditLogger',
            action: params.action,
            resource: params.resource,
          },
        });
      }
    }
  }

  /**
   * Log a create action
   */
  public async logCreate(
    userId: string,
    userName: string,
    userEmail: string,
    userRole: UserRole,
    resource: string,
    resourceId: string,
    data: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAction({
      userId,
      userName,
      userEmail,
      userRole,
      action: 'create',
      resource,
      resourceId,
      changes: {
        before: {},
        after: data,
      },
      description: `Created ${resource} with ID ${resourceId}`,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log an update action
   */
  public async logUpdate(
    userId: string,
    userName: string,
    userEmail: string,
    userRole: UserRole,
    resource: string,
    resourceId: string,
    before: Record<string, any>,
    after: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAction({
      userId,
      userName,
      userEmail,
      userRole,
      action: 'update',
      resource,
      resourceId,
      changes: {
        before,
        after,
      },
      description: `Updated ${resource} with ID ${resourceId}`,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log a delete action
   */
  public async logDelete(
    userId: string,
    userName: string,
    userEmail: string,
    userRole: UserRole,
    resource: string,
    resourceId: string,
    data: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAction({
      userId,
      userName,
      userEmail,
      userRole,
      action: 'delete',
      resource,
      resourceId,
      changes: {
        before: data,
        after: {},
      },
      description: `Deleted ${resource} with ID ${resourceId}`,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log a read/access action (for sensitive data)
   */
  public async logRead(
    userId: string,
    userName: string,
    userEmail: string,
    userRole: UserRole,
    resource: string,
    resourceId: string,
    description?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAction({
      userId,
      userName,
      userEmail,
      userRole,
      action: 'read',
      resource,
      resourceId,
      description: description || `Accessed ${resource} with ID ${resourceId}`,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log authentication events
   */
  public async logAuth(
    userId: string,
    userName: string,
    userEmail: string,
    userRole: UserRole,
    action: 'login' | 'logout' | 'password_reset',
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const descriptions = {
      login: 'User logged in',
      logout: 'User logged out',
      password_reset: 'User requested password reset',
    };

    await this.logAction({
      userId,
      userName,
      userEmail,
      userRole,
      action,
      resource: 'authentication',
      resourceId: userId,
      description: descriptions[action],
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log appointment-related actions
   */
  public async logAppointmentAction(
    userId: string,
    userName: string,
    userEmail: string,
    userRole: UserRole,
    action: 'appointment_confirmed' | 'appointment_cancelled' | 'appointment_rescheduled' | 'appointment_completed',
    appointmentId: string,
    before?: Record<string, any>,
    after?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const descriptions = {
      appointment_confirmed: 'Appointment confirmed',
      appointment_cancelled: 'Appointment cancelled',
      appointment_rescheduled: 'Appointment rescheduled',
      appointment_completed: 'Appointment marked as completed',
    };

    await this.logAction({
      userId,
      userName,
      userEmail,
      userRole,
      action,
      resource: 'appointment',
      resourceId: appointmentId,
      changes: before && after ? { before, after } : undefined,
      description: descriptions[action],
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log payment-related actions
   */
  public async logPaymentAction(
    userId: string,
    userName: string,
    userEmail: string,
    userRole: UserRole,
    action: 'payment_initiated' | 'payment_completed' | 'payment_failed' | 'refund_initiated' | 'refund_completed',
    appointmentId: string,
    amount: number,
    transactionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const descriptions = {
      payment_initiated: `Payment initiated for amount ${amount}`,
      payment_completed: `Payment completed for amount ${amount}`,
      payment_failed: `Payment failed for amount ${amount}`,
      refund_initiated: `Refund initiated for amount ${amount}`,
      refund_completed: `Refund completed for amount ${amount}`,
    };

    await this.logAction({
      userId,
      userName,
      userEmail,
      userRole,
      action,
      resource: 'payment',
      resourceId: appointmentId,
      description: descriptions[action] + (transactionId ? ` (Transaction: ${transactionId})` : ''),
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log review-related actions
   */
  public async logReviewAction(
    userId: string,
    userName: string,
    userEmail: string,
    userRole: UserRole,
    action: 'review_submitted' | 'review_approved' | 'review_rejected',
    reviewId: string,
    before?: Record<string, any>,
    after?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const descriptions = {
      review_submitted: 'Review submitted',
      review_approved: 'Review approved',
      review_rejected: 'Review rejected',
    };

    await this.logAction({
      userId,
      userName,
      userEmail,
      userRole,
      action,
      resource: 'review',
      resourceId: reviewId,
      changes: before && after ? { before, after } : undefined,
      description: descriptions[action],
      ipAddress,
      userAgent,
    });
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();
