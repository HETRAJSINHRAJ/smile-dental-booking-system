import { NextRequest, NextResponse } from 'next/server';
import notificationService from '@/lib/notifications/notificationService';

/**
 * POST /api/notifications/schedule-reminders
 * Scheduled cron job to send appointment reminders for next day
 * Runs daily at 9 AM (configured in vercel.json)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is called from a cron job or authorized source
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const sentCount = await notificationService.scheduleAppointmentReminders();

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} appointment reminders (push + email)`,
      count: sentCount,
    });
  } catch (error) {
    console.error('Error scheduling reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/schedule-reminders
 * Manual trigger for testing (requires CRON_SECRET)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized - Please provide valid Bearer token' },
        { status: 401 }
      );
    }

    const sentCount = await notificationService.scheduleAppointmentReminders();

    return NextResponse.json({
      success: true,
      message: `Manually triggered: Sent ${sentCount} appointment reminders (push + email)`,
      count: sentCount,
    });
  } catch (error) {
    console.error('Error scheduling reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
