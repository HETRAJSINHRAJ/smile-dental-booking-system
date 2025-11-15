import { NextRequest, NextResponse } from 'next/server';
import notificationService from '@/lib/notifications/notificationService';

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
      message: `Sent ${sentCount} appointment reminders`,
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
