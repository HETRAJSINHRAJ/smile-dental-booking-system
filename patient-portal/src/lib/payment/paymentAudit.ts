import { db } from '@/lib/firebase/config';
import { collection, addDoc, Timestamp, query, where, orderBy, getDocs } from 'firebase/firestore';

export interface PaymentAuditLog {
  id?: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  serviceName: string;
  providerName: string;
  paymentType: 'appointment_reservation' | 'service_payment' | 'refund';
  action: 'payment_initiated' | 'payment_success' | 'payment_failed' | 'payment_cancelled' | 'refund_initiated' | 'refund_completed';
  amount: number;
  currency: string;
  paymentMethod?: string;
  transactionId?: string;
  gatewayResponse?: any;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Timestamp;
  createdAt: Timestamp;
}

export class PaymentAuditService {
  private static instance: PaymentAuditService;
  
  private constructor() {}
  
  public static getInstance(): PaymentAuditService {
    if (!PaymentAuditService.instance) {
      PaymentAuditService.instance = new PaymentAuditService();
    }
    return PaymentAuditService.instance;
  }

  async logPaymentEvent(logData: Omit<PaymentAuditLog, 'id' | 'createdAt' | 'timestamp'>): Promise<void> {
    try {
      const auditLog: Omit<PaymentAuditLog, 'id'> = {
        ...logData,
        timestamp: Timestamp.now(),
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'payment_audit_logs'), auditLog);
      console.log('Payment audit log created successfully');
    } catch (error) {
      console.error('Error creating payment audit log:', error);
      // Don't throw error as audit logging should not break the main flow
    }
  }

  async getPaymentHistory(appointmentId: string): Promise<PaymentAuditLog[]> {
    try {
      const q = query(
        collection(db, 'payment_audit_logs'),
        where('appointmentId', '==', appointmentId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PaymentAuditLog));
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }

  async getPatientPaymentHistory(patientId: string): Promise<PaymentAuditLog[]> {
    try {
      const q = query(
        collection(db, 'payment_audit_logs'),
        where('patientId', '==', patientId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PaymentAuditLog));
    } catch (error) {
      console.error('Error fetching patient payment history:', error);
      return [];
    }
  }

  formatAuditLogForDisplay(log: PaymentAuditLog): string {
    const timestamp = log.timestamp.toDate().toLocaleString('en-IN');
    const amount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(log.amount);

    switch (log.action) {
      case 'payment_initiated':
        return `${timestamp} - Payment initiated for ${log.serviceName} with ${log.providerName} - Amount: ${amount}`;
      case 'payment_success':
        return `${timestamp} - Payment successful - Transaction ID: ${log.transactionId || 'N/A'} - Amount: ${amount}`;
      case 'payment_failed':
        return `${timestamp} - Payment failed - Error: ${log.errorMessage || 'Unknown error'}`;
      case 'payment_cancelled':
        return `${timestamp} - Payment cancelled by user`;
      case 'refund_initiated':
        return `${timestamp} - Refund initiated - Amount: ${amount}`;
      case 'refund_completed':
        return `${timestamp} - Refund completed - Transaction ID: ${log.transactionId || 'N/A'}`;
      default:
        return `${timestamp} - Unknown payment event`;
    }
  }
}

export const paymentAuditService = PaymentAuditService.getInstance();