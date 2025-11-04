import { db } from '@/lib/firebase/config';
import { collection, addDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';

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
  paymentMethod: string;
  transactionId?: string;
  gatewayResponse?: any;
  errorMessage?: string;
  createdAt?: Timestamp;
}

export interface PaymentAuditQuery {
  appointmentId?: string;
  patientId?: string;
  paymentType?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
}

class PaymentAuditService {
  private collectionName = 'payment_audit_logs';

  async logPaymentEvent(data: Omit<PaymentAuditLog, 'id' | 'createdAt'>): Promise<void> {
    try {
      const auditLog: Omit<PaymentAuditLog, 'id'> = {
        ...data,
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, this.collectionName), auditLog);
    } catch (error) {
      console.error('Error logging payment event:', error);
      throw error;
    }
  }

  async getPaymentHistory(appointmentId: string): Promise<PaymentAuditLog[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('appointmentId', '==', appointmentId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as PaymentAuditLog;
        return {
          id: doc.id,
          appointmentId: data.appointmentId,
          patientId: data.patientId,
          patientName: data.patientName,
          patientEmail: data.patientEmail,
          serviceName: data.serviceName,
          providerName: data.providerName,
          paymentType: data.paymentType,
          action: data.action,
          amount: data.amount,
          currency: data.currency,
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId,
          gatewayResponse: data.gatewayResponse,
          errorMessage: data.errorMessage,
          createdAt: data.createdAt
        };
      });
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  }

  async getPatientPaymentHistory(patientId: string): Promise<PaymentAuditLog[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('patientId', '==', patientId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as PaymentAuditLog;
        return {
          id: doc.id,
          appointmentId: data.appointmentId,
          patientId: data.patientId,
          patientName: data.patientName,
          patientEmail: data.patientEmail,
          serviceName: data.serviceName,
          providerName: data.providerName,
          paymentType: data.paymentType,
          action: data.action,
          amount: data.amount,
          currency: data.currency,
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId,
          gatewayResponse: data.gatewayResponse,
          errorMessage: data.errorMessage,
          createdAt: data.createdAt
        };
      });
    } catch (error) {
      console.error('Error getting patient payment history:', error);
      throw error;
    }
  }

  async getPaymentAuditLogs(queryParams: PaymentAuditQuery = {}): Promise<PaymentAuditLog[]> {
    try {
      let q = collection(db, this.collectionName) as any;
      const constraints: any[] = [];

      if (queryParams.appointmentId) {
        constraints.push(where('appointmentId', '==', queryParams.appointmentId));
      }

      if (queryParams.patientId) {
        constraints.push(where('patientId', '==', queryParams.patientId));
      }

      if (queryParams.paymentType) {
        constraints.push(where('paymentType', '==', queryParams.paymentType));
      }

      if (queryParams.action) {
        constraints.push(where('action', '==', queryParams.action));
      }

      if (queryParams.startDate) {
        constraints.push(where('createdAt', '>=', Timestamp.fromDate(queryParams.startDate)));
      }

      if (queryParams.endDate) {
        constraints.push(where('createdAt', '<=', Timestamp.fromDate(queryParams.endDate)));
      }

      constraints.push(orderBy('createdAt', 'desc'));

      q = query(q, ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data() as PaymentAuditLog;
        return {
          id: doc.id,
          appointmentId: data.appointmentId,
          patientId: data.patientId,
          patientName: data.patientName,
          patientEmail: data.patientEmail,
          serviceName: data.serviceName,
          providerName: data.providerName,
          paymentType: data.paymentType,
          action: data.action,
          amount: data.amount,
          currency: data.currency,
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId,
          gatewayResponse: data.gatewayResponse,
          errorMessage: data.errorMessage,
          createdAt: data.createdAt
        };
      });
    } catch (error) {
      console.error('Error getting payment audit logs:', error);
      throw error;
    }
  }
}

export const paymentAuditService = new PaymentAuditService();