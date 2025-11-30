import { NextRequest, NextResponse } from 'next/server';
import notificationQueue from '@/lib/notifications/notificationQueue';
import { NotificationType, NotificationChannel } from '@/types/notification';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface BatchNotificationRequest {
  notifications: Array<{
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
  }>;
}

/**
 * Create a batch of notifications
 */
export async function POST(request: NextRequest) {
  try {
    const body: BatchNotificationRequest = await request.json();

    // Validate request
    if (!body.notifications || !Array.isArray(body.notifications) || body.notifications.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Notifications array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate each notification
    for (const notification of body.notifications) {
      if (!notification.userId || !notification.userEmail || !notification.userName || 
          !notification.title || !notification.body || !notification.type) {
        return NextResponse.json(
          { success: false, error: 'Each notification must have userId, userEmail, userName, title, body, and type' },
          { status: 400 }
        );
      }

      if (!notification.channels || notification.channels.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Each notification must have at least one channel' },
          { status: 400 }
        );
      }
    }

    // Enqueue all notifications
    const notificationIds = await notificationQueue.enqueueBatch(body.notifications);

    // Create a batch record
    const batchId = await notificationQueue.createBatch(notificationIds);

    return NextResponse.json({
      success: true,
      batchId,
      notificationIds,
      totalNotifications: notificationIds.length,
      message: 'Batch created successfully',
    });
  } catch (error) {
    console.error('Error creating notification batch:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create batch',
      },
      { status: 500 }
    );
  }
}
