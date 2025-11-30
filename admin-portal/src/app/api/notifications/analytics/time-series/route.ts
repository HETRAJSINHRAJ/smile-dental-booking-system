import { NextRequest, NextResponse } from 'next/server';
import notificationAnalytics from '@/lib/notifications/notificationAnalytics';
import { NotificationChannel, NotificationType } from '@/types/notification';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Get notification analytics time series
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { success: false, error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);
    const userId = searchParams.get('userId') || undefined;
    const channel = searchParams.get('channel') as NotificationChannel | undefined;
    const type = searchParams.get('type') as NotificationType | undefined;

    const timeSeries = await notificationAnalytics.getAnalyticsTimeSeries(
      startDate,
      endDate,
      { userId, channel, type }
    );

    return NextResponse.json({
      success: true,
      timeSeries,
      filters: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        userId,
        channel,
        type,
      },
    });
  } catch (error) {
    console.error('Error getting notification analytics time series:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get time series',
      },
      { status: 500 }
    );
  }
}
