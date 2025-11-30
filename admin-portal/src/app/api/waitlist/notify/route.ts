import { NextRequest, NextResponse } from 'next/server';
import { notifyNextWaitlistUser } from '@/lib/waitlist/waitlistNotificationService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId, serviceId, appointmentDate, availableTime } = body;

    if (!providerId || !serviceId || !appointmentDate || !availableTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const date = new Date(appointmentDate);
    const notified = await notifyNextWaitlistUser(
      providerId,
      serviceId,
      date,
      availableTime
    );

    return NextResponse.json({ notified });
  } catch (error) {
    console.error('Error notifying waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to notify waitlist user' },
      { status: 500 }
    );
  }
}
