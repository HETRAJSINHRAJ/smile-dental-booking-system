import { NextRequest, NextResponse } from 'next/server';
import notificationAnalytics from '@/lib/notifications/notificationAnalytics';
import { NotificationChannel } from '@/types/notification';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface TrackEventRequest {
  notificationId: string;
  userId: string;
  channel: NotificationChannel;
  event: 'open' | 'click';
}

/**
 * Track notification events (open, click)
 */
export async function POST(request: NextRequest) {
  try {
    const body: TrackEventRequest = await request.json();

    // Validate required fields
    if (!body.notificationId || !body.userId || !body.channel || !body.event) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate event type
    if (body.event !== 'open' && body.event !== 'click') {
      return NextResponse.json(
        { success: false, error: 'Invalid event type. Must be "open" or "click"' },
        { status: 400 }
      );
    }

    // Track the event
    if (body.event === 'open') {
      await notificationAnalytics.trackOpen(body.notificationId, body.userId, body.channel);
    } else {
      await notificationAnalytics.trackClick(body.notificationId, body.userId, body.channel);
    }

    return NextResponse.json({
      success: true,
      message: `${body.event} event tracked successfully`,
    });
  } catch (error) {
    console.error('Error tracking notification event:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track event',
      },
      { status: 500 }
    );
  }
}
