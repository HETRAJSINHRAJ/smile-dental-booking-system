import { AuditLogger } from '../AuditLogger';

// Mock Firebase before importing
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn().mockResolvedValue({ id: 'test-log-id' }),
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
  },
}));

jest.mock('@/lib/firebase/config', () => ({
  db: {},
}));

import { addDoc, collection } from 'firebase/firestore';

const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockCollection = collection as jest.MockedFunction<typeof collection>;

describe('AuditLogger', () => {
  let auditLogger: AuditLogger;

  beforeEach(() => {
    jest.clearAllMocks();
    auditLogger = AuditLogger.getInstance();
    mockAddDoc.mockResolvedValue({ id: 'test-log-id' } as any);
    mockCollection.mockReturnValue({} as any);
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = AuditLogger.getInstance();
      const instance2 = AuditLogger.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('logAction', () => {
    it('should log action with all parameters', async () => {
      await auditLogger.logAction({
        userId: 'user123',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        userRole: 'admin',
        action: 'create',
        resource: 'appointment',
        resourceId: 'appt123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(mockAddDoc).toHaveBeenCalledTimes(1);
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: 'user123',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          userRole: 'admin',
          action: 'create',
          resource: 'appointment',
          resourceId: 'appt123',
          metadata: expect.objectContaining({
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0',
          }),
        })
      );
    });

    it('should handle missing optional parameters', async () => {
      await auditLogger.logAction({
        userId: 'user123',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        userRole: 'admin',
        action: 'read',
        resource: 'patient',
        resourceId: 'patient123',
      });

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          metadata: expect.objectContaining({
            ipAddress: 'unknown',
            userAgent: 'unknown',
          }),
        })
      );
    });

    it('should not throw error on failure', async () => {
      mockAddDoc.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(
        auditLogger.logAction({
          userId: 'user123',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          userRole: 'admin',
          action: 'delete',
          resource: 'service',
          resourceId: 'service123',
        })
      ).resolves.not.toThrow();
    });
  });

  describe('logCreate', () => {
    it('should log create action with before/after changes', async () => {
      const data = { name: 'New Service', price: 1000 };

      await auditLogger.logCreate(
        'user123',
        'John Doe',
        'john@example.com',
        'admin',
        'service',
        'service123',
        data
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          action: 'create',
          resource: 'service',
          resourceId: 'service123',
          changes: {
            before: {},
            after: data,
          },
        })
      );
    });
  });

  describe('logUpdate', () => {
    it('should log update action with before/after changes', async () => {
      const before = { name: 'Old Service', price: 1000 };
      const after = { name: 'Updated Service', price: 1500 };

      await auditLogger.logUpdate(
        'user123',
        'John Doe',
        'john@example.com',
        'admin',
        'service',
        'service123',
        before,
        after
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          action: 'update',
          resource: 'service',
          resourceId: 'service123',
          changes: {
            before,
            after,
          },
        })
      );
    });
  });

  describe('logDelete', () => {
    it('should log delete action', async () => {
      const data = { name: 'Deleted Service', price: 1000 };

      await auditLogger.logDelete(
        'user123',
        'John Doe',
        'john@example.com',
        'admin',
        'service',
        'service123',
        data
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          action: 'delete',
          resource: 'service',
          resourceId: 'service123',
          changes: {
            before: data,
            after: {},
          },
        })
      );
    });
  });

  describe('logRead', () => {
    it('should log read/access action', async () => {
      await auditLogger.logRead(
        'user123',
        'John Doe',
        'john@example.com',
        'admin',
        'patient',
        'patient123',
        'Viewed patient medical records'
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          action: 'read',
          resource: 'patient',
          resourceId: 'patient123',
          description: 'Viewed patient medical records',
        })
      );
    });
  });

  describe('logAuth', () => {
    it('should log login action', async () => {
      await auditLogger.logAuth(
        'user123',
        'John Doe',
        'john@example.com',
        'admin',
        'login',
        '192.168.1.1'
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          action: 'login',
          resource: 'authentication',
          description: 'User logged in',
        })
      );
    });

    it('should log logout action', async () => {
      await auditLogger.logAuth(
        'user123',
        'John Doe',
        'john@example.com',
        'admin',
        'logout'
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          action: 'logout',
          description: 'User logged out',
        })
      );
    });
  });

  describe('logAppointmentAction', () => {
    it('should log appointment confirmation', async () => {
      await auditLogger.logAppointmentAction(
        'user123',
        'John Doe',
        'john@example.com',
        'admin',
        'appointment_confirmed',
        'appt123'
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          action: 'appointment_confirmed',
          resource: 'appointment',
          resourceId: 'appt123',
          description: 'Appointment confirmed',
        })
      );
    });

    it('should log appointment rescheduling with changes', async () => {
      const before = { date: '2024-01-01', time: '10:00' };
      const after = { date: '2024-01-02', time: '14:00' };

      await auditLogger.logAppointmentAction(
        'user123',
        'John Doe',
        'john@example.com',
        'admin',
        'appointment_rescheduled',
        'appt123',
        before,
        after
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          action: 'appointment_rescheduled',
          changes: { before, after },
        })
      );
    });
  });

  describe('logPaymentAction', () => {
    it('should log payment completion', async () => {
      await auditLogger.logPaymentAction(
        'user123',
        'John Doe',
        'john@example.com',
        'patient',
        'payment_completed',
        'appt123',
        1000,
        'txn_123456'
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          action: 'payment_completed',
          resource: 'payment',
          resourceId: 'appt123',
          description: expect.stringContaining('1000'),
          description: expect.stringContaining('txn_123456'),
        })
      );
    });

    it('should log refund initiation', async () => {
      await auditLogger.logPaymentAction(
        'user123',
        'Admin User',
        'admin@example.com',
        'admin',
        'refund_initiated',
        'appt123',
        500
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          action: 'refund_initiated',
          description: expect.stringContaining('500'),
        })
      );
    });
  });

  describe('logReviewAction', () => {
    it('should log review approval', async () => {
      const before = { status: 'pending' };
      const after = { status: 'approved' };

      await auditLogger.logReviewAction(
        'user123',
        'Admin User',
        'admin@example.com',
        'admin',
        'review_approved',
        'review123',
        before,
        after
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          action: 'review_approved',
          resource: 'review',
          resourceId: 'review123',
          changes: { before, after },
        })
      );
    });
  });
});
