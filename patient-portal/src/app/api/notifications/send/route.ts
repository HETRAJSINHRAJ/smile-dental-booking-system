import { NextRequest, NextResponse } from 'next/server';
import notificationService from '@/lib/notifications/notificationService';
import { rateLimitMiddleware, addRateLimitHeaders } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, body: messageBody, type, data, appointmentId } = body;

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

    if (!userId || !title || !messageBody || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const success = await notificationService.sendNotification({
      userId,
      title,
      body: messageBody,
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
