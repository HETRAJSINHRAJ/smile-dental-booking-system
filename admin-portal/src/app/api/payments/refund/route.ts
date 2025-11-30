import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { paymentAuditService } from '@/lib/payment/paymentAudit';
import { auditLogger } from '@/lib/audit';
import { getRequestMetadata } from '@/lib/audit/requestUtils';
import { emailService } from '@/lib/email/emailService';
import { rateLimitMiddleware, addRateLimitHeaders } from '@/lib/ratelimit';
import { refundRequestSchema, validateInput, formatZodErrors, sanitizeText, validateCSRFMiddleware, createCSRFErrorResponse } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Validate CSRF token for state-changing operation
    const csrfResult = await validateCSRFMiddleware(request);
    if (!csrfResult.valid) {
      return createCSRFErrorResponse(csrfResult.error || 'CSRF validation failed');
    }

    const body = await request.json();

    // Validate input using Zod schema
    const validation = validateInput(refundRequestSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: formatZodErrors(validation.errors!) 
        },
        { status: 400 }
      );
    }

    const { appointmentId, amount, reason, adminUserId } = validation.data!;
    
    // Sanitize the reason text
    const sanitizedReason = sanitizeText(reason);

    // Apply rate limiting (3 attempts per hour per user)
    const rateLimitIdentifier = adminUserId || appointmentId || 'anonymous';
    const { allowed, response, result } = await rateLimitMiddleware(
      request,
      'payments',
      rateLimitIdentifier
    );
    
    if (!allowed && response) {
      return response;
    }

    // Get appointment details
    const appointmentRef = adminDb.collection('appointments').doc(appointmentId);
    const appointmentDoc = await appointmentRef.get();

    if (!appointmentDoc.exists) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const appointment = appointmentDoc.data();

    // Validate refund eligibility
    if (appointment?.paymentStatus === 'refunded') {
      return NextResponse.json(
        { error: 'This appointment has already been refunded' },
        { status: 400 }
      );
    }

    if (appointment?.paymentStatus !== 'reservation_paid' && appointment?.paymentStatus !== 'fully_paid') {
      return NextResponse.json(
        { error: 'No payment found to refund' },
        { status: 400 }
      );
    }

    if (amount > appointment.paymentAmount) {
      return NextResponse.json(
        { error: 'Refund amount exceeds payment amount' },
        { status: 400 }
      );
    }

    // Log refund initiation
    await paymentAuditService.logPaymentEvent({
      appointmentId,
      patientId: appointment.userId,
      patientName: appointment.userName,
      patientEmail: appointment.userEmail,
      serviceName: appointment.serviceName,
      providerName: appointment.providerName,
      paymentType: 'refund',
      action: 'refund_initiated',
      amount,
      currency: 'INR',
      paymentMethod: appointment.paymentMethod || 'razorpay',
      transactionId: appointment.paymentTransactionId,
      gatewayResponse: {
        reason: sanitizedReason,
        originalAmount: appointment.paymentAmount,
        refundAmount: amount,
      },
    });

    // Process refund with Razorpay (if payment gateway is integrated)
    // For now, we'll simulate the refund process
    // In production, you would call Razorpay's refund API here
    let refundId = `rfnd_${Date.now()}`;
    
    // TODO: Integrate with Razorpay refund API
    // const razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID!,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET!,
    // });
    // const refund = await razorpay.payments.refund(appointment.paymentTransactionId, {
    //   amount: amount * 100, // Razorpay expects amount in paise
    //   notes: { reason },
    // });
    // refundId = refund.id;

    // Update appointment with refund details
    const { FieldValue } = await import('firebase-admin/firestore');
    await appointmentRef.update({
      paymentStatus: 'refunded',
      refundAmount: amount,
      refundReason: sanitizedReason,
      refundId,
      refundedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Log refund completion
    await paymentAuditService.logPaymentEvent({
      appointmentId,
      patientId: appointment.userId,
      patientName: appointment.userName,
      patientEmail: appointment.userEmail,
      serviceName: appointment.serviceName,
      providerName: appointment.providerName,
      paymentType: 'refund',
      action: 'refund_completed',
      amount,
      currency: 'INR',
      paymentMethod: appointment.paymentMethod || 'razorpay',
      transactionId: refundId,
      gatewayResponse: {
        reason: sanitizedReason,
        originalAmount: appointment.paymentAmount,
        refundAmount: amount,
        refundId,
      },
    });

    // Create audit log entry
    const metadata = getRequestMetadata(request);
    await auditLogger.logAction(
      'system', // userId - should be replaced with actual admin user ID
      'Admin',
      'admin@system.com',
      'admin',
      'refund_completed',
      'appointment',
      appointmentId,
      { paymentStatus: appointment.paymentStatus, refundAmount: 0 },
      { paymentStatus: 'refunded', refundAmount: amount },
      metadata,
      `Refund of ${amount} INR processed. Reason: ${sanitizedReason}`
    );

    // Send refund notification email to patient
    try {
      await emailService.sendRefundNotification(appointment.userEmail, {
        patientName: appointment.userName,
        serviceName: appointment.serviceName,
        appointmentDate: appointment.appointmentDate.toDate().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        refundAmount: amount,
        reason: sanitizedReason,
        confirmationNumber: appointment.confirmationNumber || appointmentId.slice(0, 8),
      });
    } catch (emailError) {
      console.error('Error sending refund notification email:', emailError);
      // Don't fail the refund if email fails
    }

    const successResponse = NextResponse.json({
      success: true,
      refundId,
      message: 'Refund processed successfully',
    });
    
    // Add rate limit headers to successful response
    addRateLimitHeaders(successResponse, result);
    
    return successResponse;
  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
