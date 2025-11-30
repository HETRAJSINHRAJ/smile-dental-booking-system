import { NextRequest, NextResponse } from 'next/server';
import notificationQueue from '@/lib/notifications/notificationQueue';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Process pending notifications in the queue
 * This endpoint should be called by a cron job
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization (you can add API key check here)
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Process pending notifications
    const processedCount = await notificationQueue.processPendingNotifications();

    // Get queue statistics
    const stats = await notificationQueue.getStats();

    return NextResponse.json({
      success: true,
      processedCount,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing notification queue:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process queue',
      },
      { status: 500 }
    );
  }
}

/**
 * Get notification queue statistics
 */
export async function GET(request: NextRequest) {
  try {
    const stats = await notificationQueue.getStats();

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting queue stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get stats',
      },
      { status: 500 }
    );
  }
}
