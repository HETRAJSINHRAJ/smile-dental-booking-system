/**
 * API endpoint to send test SMS
 * POST /api/sms/test
 */

import { NextRequest, NextResponse } from 'next/server';
import smsService from '@/lib/sms/smsService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, message } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { success: false, error: 'phone and message are required' },
        { status: 400 }
      );
    }

    const sent = await smsService.sendCustomSMS(phone, message);

    return NextResponse.json({
      success: sent,
      message: sent ? 'SMS sent successfully' : 'Failed to send SMS',
    });
  } catch (error) {
    console.error('Error sending test SMS:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const status = smsService.getStatus();
  
  return NextResponse.json({
    success: true,
    ...status,
  });
}
