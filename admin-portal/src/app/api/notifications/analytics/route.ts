import { NextRequest, NextResponse } from 'next/server';
import notificationAnalytics from '@/lib/notifications/notificationAnalytics';
import { NotificationChannel, NotificationType } from '@/types/notification';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Get notification analytics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    const userId = searchParams.get('userId') || undefined;
    const channel = searchParams.get('channel') as NotificationChannel | undefined;
    const type = searchParams.get('type') as NotificationType | undefined;

    const analytics = await notificationAnalytics.getAnalytics({
      startDate,
      endDate,
      userId,
      channel,
      type,
    });

    return NextResponse.json({
      success: true,
      analytics,
      filters: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        userId,
        channel,
        type,
      },
    });
  } catch (error) {
    console.error('Error getting notification analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get analytics',
      },
      { status: 500 }
    );
  }
}
