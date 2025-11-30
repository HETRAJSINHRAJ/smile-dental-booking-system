import { NextRequest, NextResponse } from 'next/server';
import notificationQueue from '@/lib/notifications/notificationQueue';
import { NotificationType, NotificationChannel } from '@/types/notification';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ScheduleNotificationRequest {
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  title: string;
  body: string;
  type: NotificationType;
  channels: NotificationChannel[];
  data?: Record<string, any>;
  appointmentId?: string;
  scheduledFor?: string; // ISO date string
}

/**
 * Schedule a notification for future delivery
 */
export async function POST(request: NextRequest) {
  try {
    const body: ScheduleNotificationRequest = await request.json();

    // Validate required fields
    if (!body.userId || !body.userEmail || !body.userName || !body.title || !body.body || !body.type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate channels
    if (!body.channels || body.channels.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one notification channel is required' },
        { status: 400 }
      );
    }

    let notificationId: string;

    if (body.scheduledFor) {
      // Schedule for future delivery
      const scheduledDate = new Date(body.scheduledFor);
      
      if (scheduledDate <= new Date()) {
        return NextResponse.json(
          { success: false, error: 'Scheduled time must be in the future' },
          { status: 400 }
        );
      }

      notificationId = await notificationQueue.schedule(
        {
          userId: body.userId,
          userEmail: body.userEmail,
          userName: body.userName,
          userPhone: body.userPhone,
          title: body.title,
          body: body.body,
          type: body.type,
          channels: body.channels,
          data: body.data,
          appointmentId: body.appointmentId,
        },
        scheduledDate
      );
    } else {
      // Queue for immediate delivery
      notificationId = await notificationQueue.enqueue({
        userId: body.userId,
        userEmail: body.userEmail,
        userName: body.userName,
        userPhone: body.userPhone,
        title: body.title,
        body: body.body,
        type: body.type,
        channels: body.channels,
        data: body.data,
        appointmentId: body.appointmentId,
      });
    }

    return NextResponse.json({
      success: true,
      notificationId,
      message: body.scheduledFor ? 'Notification scheduled successfully' : 'Notification queued successfully',
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to schedule notification',
      },
      { status: 500 }
    );
  }
}
