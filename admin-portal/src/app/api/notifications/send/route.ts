import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import notificationService from '@/lib/notifications/notificationService';
import { rateLimitMiddleware, addRateLimitHeaders } from '@/lib/ratelimit';
import { validateInput, formatZodErrors, sanitizeText } from '@/lib/validation';

// Zod schema for send notification request
const sendNotificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  body: z.string().min(1, 'Body is required').max(500, 'Body is too long'),
  type: z.enum(['appointment_reminder', 'appointment_confirmation', 'appointment_cancellation', 'payment_receipt', 'general']),
  data: z.record(z.unknown()).optional(),
  appointmentId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input using Zod schema
    const validation = validateInput(sendNotificationSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: formatZodErrors(validation.errors!) 
        },
        { status: 400 }
      );
    }

    const { userId, title, body: messageBody, type, data, appointmentId } = validation.data!;

    // Sanitize text inputs
    const sanitizedTitle = sanitizeText(title);
    const sanitizedBody = sanitizeText(messageBody);

    // Apply rate limiting (10 requests per hour per user)
    const rateLimitIdentifier = userId || 'anonymous';
    const { allowed, response, result } = await rateLimitMiddleware(
      request,
      'notifications',
      rateLimitIdentifier
    );
    
    if (!allowed && response) {
      return response;
    }

    const success = await notificationService.sendNotification({
      userId,
      title: sanitizedTitle,
      body: sanitizedBody,
      type,
      data,
      appointmentId,
    });

    if (success) {
      const successResponse = NextResponse.json({ success: true, message: 'Notification sent successfully' });
      addRateLimitHeaders(successResponse, result);
      return successResponse;
    } else {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send notification API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
