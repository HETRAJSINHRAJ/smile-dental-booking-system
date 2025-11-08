import React from 'react';
import { Modal } from 'react-native';
import { PaymentReceiptView } from './PaymentReceiptView';

interface PaymentSuccessModalProps {
  visible: boolean;
  appointmentData: {
    id: string;
    serviceName: string;
    providerName: string;
    date: string;
    time: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
  };
  paymentData: {
    transactionId: string;
    amount: number;
    taxAmount: number;
    totalAmount: number;
    paymentMethod: string;
    paymentDate: string;
    paymentDescription: string;
  };
  servicePaymentInfo?: {
    serviceAmount: number;
    serviceTax: number;
    serviceTotal: number;
    paymentDue: string;
  };
  onClose: () => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  visible,
  appointmentData,
  paymentData,
  servicePaymentInfo,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <PaymentReceiptView
        appointmentData={appointmentData}
        paymentData={paymentData}
        servicePaymentInfo={servicePaymentInfo}
        onClose={onClose}
      />
    </Modal>
  );
};
