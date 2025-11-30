import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { Appointment } from '@/types/shared';
import { uploadToUploadcare } from '@/lib/uploadcare';
import { pdf } from '@react-pdf/renderer';
import { ReceiptDocument } from '@/components/receipts/ReceiptPDF';
import { adminDb } from '@/lib/firebase/admin';
import { rateLimitMiddleware, addRateLimitHeaders } from '@/lib/ratelimit';
import { receiptGenerationSchema, validateInput, formatZodErrors, validateCSRFMiddleware, createCSRFErrorResponse } from '@/lib/validation';

const db = adminDb;

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

/**
 * POST /api/receipts/generate
 * Generate receipt PDF and upload to Uploadcare
 * Rate limited: 5 requests per hour per user
 */
export async function POST(request: NextRequest) {
  try {
    // Validate CSRF token for state-changing operation
    const csrfResult = await validateCSRFMiddleware(request);
    if (!csrfResult.valid) {
      return createCSRFErrorResponse(csrfResult.error || 'CSRF validation failed');
    }

    const body = await request.json();
    
    // Validate input using Zod schema
    const validation = validateInput(receiptGenerationSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: formatZodErrors(validation.errors!) 
        },
        { status: 400 }
      );
    }

    const { appointmentId, regenerate } = validation.data!;
    const userId = body.userId; // Optional field not in schema
    
    // Apply rate limiting (5 requests per hour per user)
    const rateLimitIdentifier = userId || appointmentId || 'anonymous';
    const { allowed, response, result } = await rateLimitMiddleware(
      request,
      'receipts',
      rateLimitIdentifier
    );
    
    if (!allowed && response) {
      return response;
    }

    console.log('Generating receipt for appointment:', appointmentId);

    // Fetch appointment from Firestore
    const appointmentRef = db.collection('appointments').doc(appointmentId);
    const appointmentDoc = await appointmentRef.get();

    if (!appointmentDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const appointmentData = appointmentDoc.data() as any;

    // Check if receipt already exists and regenerate is false
    if (appointmentData.receiptUrl && !regenerate) {
      return NextResponse.json({
        success: true,
        receiptUrl: appointmentData.receiptUrl,
        receiptId: appointmentData.receiptId,
        generatedAt: appointmentData.receiptGeneratedAt,
        message: 'Receipt already exists',
      });
    }

    // Convert Firestore Timestamp to Date
    const appointmentDate = appointmentData.appointmentDate?.toDate 
      ? appointmentData.appointmentDate.toDate() 
      : new Date(appointmentData.appointmentDate);

    // Prepare receipt data
    const receiptData = {
      appointmentId: appointmentDoc.id,
      receiptNumber: appointmentData.receiptId || generateReceiptNumber(),
      patientName: appointmentData.userName || appointmentData.patientName,
      patientEmail: appointmentData.userEmail || appointmentData.patientEmail,
      patientPhone: appointmentData.userPhone || appointmentData.patientPhone,
      serviceName: appointmentData.serviceName,
      providerName: appointmentData.providerName,
      appointmentDate,
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      confirmationNumber: appointmentData.confirmationNumber,
      issueDate: new Date(),
      // Payment information
      paymentAmount: appointmentData.paymentAmount || 0,
      servicePaymentAmount: appointmentData.servicePaymentAmount || 0,
      paymentStatus: appointmentData.paymentStatus || 'pending',
      servicePaymentStatus: appointmentData.servicePaymentStatus || 'pending',
      paymentMethod: appointmentData.paymentMethod,
      paymentTransactionId: appointmentData.paymentTransactionId,
    };

    console.log('Receipt data prepared:', {
      appointmentId: receiptData.appointmentId,
      receiptNumber: receiptData.receiptNumber,
      patientName: receiptData.patientName,
    });

    // Generate PDF blob using @react-pdf/renderer
    console.log('Generating PDF...');
    const pdfBlob = await pdf(
      ReceiptDocument({ receiptData })
    ).toBlob();

    // Convert blob to file for upload
    const fileName = `receipt_${receiptData.receiptNumber}.pdf`;
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    console.log('Uploading PDF to Uploadcare...');
    const uploadcareUrl = await uploadToUploadcare(file);

    if (!uploadcareUrl) {
      console.error('Upload to Uploadcare returned null');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to upload receipt to Uploadcare. Please check your Uploadcare configuration.' 
        },
        { status: 500 }
      );
    }

    console.log('Receipt uploaded to Uploadcare:', uploadcareUrl);

    // Wait for Uploadcare to process the file
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update appointment with receipt information
    const updateData = {
      receiptUrl: uploadcareUrl,
      receiptGenerated: true,
      receiptId: receiptData.receiptNumber,
      receiptGeneratedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await appointmentRef.update(updateData);

    console.log('Receipt generated and uploaded successfully');

    const successResponse = NextResponse.json({
      success: true,
      receiptUrl: uploadcareUrl,
      receiptId: receiptData.receiptNumber,
      generatedAt: Timestamp.now().toDate(),
    });
    
    // Add rate limit headers to successful response
    addRateLimitHeaders(successResponse, result);
    
    return successResponse;

  } catch (error) {
    console.error('Error generating receipt:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate receipt' 
      },
      { status: 500 }
    );
  }
}
