import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    paymentId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { paymentId } = params;
    const { searchParams } = new URL(request.url);
    const gateway = searchParams.get('gateway');

    // For test environment, return mock payment status
    const mockStatus = 'captured'; // Possible values: created, authorized, captured, refunded, failed
    
    return NextResponse.json({ 
      status: mockStatus,
      paymentId,
      gateway: gateway || 'razorpay',
      message: `Payment status: ${mockStatus}`
    });

  } catch (error) {
    console.error('Error getting payment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}