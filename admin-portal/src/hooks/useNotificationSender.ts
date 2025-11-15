import { useState } from 'react';
import { NotificationType } from '@/lib/notifications/notificationService';

interface SendNotificationParams {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  appointmentId?: string;
}

export const useNotificationSender = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendNotification = async (params: SendNotificationParams): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send notification');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send notification';
      setError(errorMessage);
      console.error('Error sending notification:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendAppointmentConfirmation = async (
    userId: string,
    appointmentDetails: {
      serviceName: string;
      providerName: string;
      date: string;
      time: string;
      appointmentId: string;
    }
  ): Promise<boolean> => {
    return sendNotification({
      userId,
      title: 'Appointment Confirmed',
      body: `Your appointment for ${appointmentDetails.serviceName} with ${appointmentDetails.providerName} on ${appointmentDetails.date} at ${appointmentDetails.time} has been confirmed.`,
      type: 'appointment_confirmed',
      appointmentId: appointmentDetails.appointmentId,
      data: appointmentDetails,
    });
  };

  const sendAppointmentCancellation = async (
    userId: string,
    appointmentDetails: {
      serviceName: string;
      providerName: string;
      date: string;
      time: string;
      appointmentId: string;
      reason?: string;
    }
  ): Promise<boolean> => {
    return sendNotification({
      userId,
      title: 'Appointment Cancelled',
      body: `Your appointment for ${appointmentDetails.serviceName} on ${appointmentDetails.date} has been cancelled.${appointmentDetails.reason ? ` Reason: ${appointmentDetails.reason}` : ''}`,
      type: 'appointment_cancelled',
      appointmentId: appointmentDetails.appointmentId,
      data: appointmentDetails,
    });
  };

  const sendPaymentSuccess = async (
    userId: string,
    paymentDetails: {
      amount: number;
      serviceName: string;
      transactionId: string;
      appointmentId: string;
    }
  ): Promise<boolean> => {
    return sendNotification({
      userId,
      title: 'Payment Successful',
      body: `Your payment of ₹${paymentDetails.amount} for ${paymentDetails.serviceName} was successful.`,
      type: 'payment_success',
      appointmentId: paymentDetails.appointmentId,
      data: paymentDetails,
    });
  };

  return {
    sendNotification,
    sendAppointmentConfirmation,
    sendAppointmentCancellation,
    sendPaymentSuccess,
    loading,
    error,
  };
};
