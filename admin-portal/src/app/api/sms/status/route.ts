/**
 * API endpoint to check SMS delivery status
 * GET /api/sms/status?messageSid=SMxxxx
 */

import { NextRequest, NextResponse } from 'next/server';
import smsService from '@/lib/sms/smsService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const messageSid = searchParams.get('messageSid');

    if (!messageSid) {
      return NextResponse.json(
        { success: false, error: 'messageSid is required' },
        { status: 400 }
      );
    }

    const status = await smsService.checkDeliveryStatus(messageSid);

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Unable to fetch delivery status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageSid,
      status,
    });
  } catch (error) {
    console.error('Error checking SMS status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
