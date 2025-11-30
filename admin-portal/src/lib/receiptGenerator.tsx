import { Appointment } from '@/types/shared';
import { updateDocument } from '@/lib/firebase/firestore';
import { uploadToUploadcare } from '@/lib/uploadcare';
import { pdf } from '@react-pdf/renderer';
import { Timestamp } from 'firebase/firestore';
import { ReceiptDocument } from '@/components/receipts/ReceiptPDF';

/**
 * Generate receipt PDF and upload to Uploadcare
 * Following the same pattern as service/provider image uploads
 */
export async function generateAndUploadReceipt(appointment: Appointment): Promise<string | null> {
  try {
    console.log('Generating receipt for appointment:', appointment.id);

    // Prepare receipt data
    const receiptData = {
      appointmentId: appointment.id,
      receiptNumber: generateReceiptNumber(),
      patientName: appointment.userName,
      patientEmail: appointment.userEmail,
      patientPhone: appointment.userPhone,
      serviceName: appointment.serviceName,
      providerName: appointment.providerName,
      appointmentDate: appointment.appointmentDate.toDate(),
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      confirmationNumber: appointment.confirmationNumber,
      issueDate: new Date(),
      // Payment information with defaults
      paymentAmount: appointment.paymentAmount || 0,
      servicePaymentAmount: appointment.servicePaymentAmount || 0,
      paymentStatus: appointment.paymentStatus || 'pending',
      servicePaymentStatus: appointment.servicePaymentStatus || 'pending',
      paymentMethod: appointment.paymentMethod,
      paymentTransactionId: appointment.paymentTransactionId,
    };

    // Generate PDF blob (same pattern as images)
    const pdfBlob = await pdf(<ReceiptDocument receiptData={receiptData} />).toBlob();

    // Convert blob to file (same as image upload)
    const fileName = `receipt_${receiptData.receiptNumber}.pdf`;
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    // Upload to Uploadcare (same CDN as images)
    console.log('Uploading receipt PDF to Uploadcare...');
    const uploadcareUrl = await uploadToUploadcare(file);
    
    if (!uploadcareUrl) {
      console.error('Upload to Uploadcare returned null');
      throw new Error('Failed to upload receipt to Uploadcare. Please check your Uploadcare configuration.');
    }

    console.log('Receipt uploaded to Uploadcare:', uploadcareUrl);

    // Note: Uploadcare may take a few seconds to make the file available on CDN
    // We'll save the URL immediately and let Uploadcare handle the processing
    console.log('Waiting for Uploadcare to process file...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

    // Update appointment with receipt URL (same as image URL storage)
    await updateDocument('appointments', appointment.id, {
      receiptUrl: uploadcareUrl,
      receiptGenerated: true,
      receiptId: receiptData.receiptNumber,
      receiptGeneratedAt: Timestamp.now(),
    });

    console.log('Receipt generated and uploaded successfully:', uploadcareUrl);
    return uploadcareUrl;
  } catch (error) {
    console.error('Error generating receipt:', error);
    return null;
  }
}

/**
 * Generate unique receipt number
 */
function generateReceiptNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  
  return `RCP-${year}${month}${day}-${random}`;
}
