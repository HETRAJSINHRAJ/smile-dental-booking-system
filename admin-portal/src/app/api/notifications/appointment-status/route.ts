import { NextRequest, NextResponse } from 'next/server';
import { sendAppointmentConfirmation, sendAppointmentCancellation } from '@/lib/notifications/notificationService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, appointmentDetails } = body;

    if (!userId || !type || !appointmentDetails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let success = false;

    if (type === 'confirmation') {
      success = await sendAppointmentConfirmation(userId, appointmentDetails);
    } else if (type === 'cancellation') {
      success = await sendAppointmentCancellation(userId, appointmentDetails);
    } else {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
