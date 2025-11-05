import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, amount, reason, gateway } = body;

    // Validate required fields
    if (!paymentId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentId, amount' },
        { status: 400 }
      );
    }

    // For test environment, simulate successful refund
    const mockRefundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return NextResponse.json({ 
      success: true,
      refundId: mockRefundId,
      paymentId,
      amount,
      status: 'processed',
      message: 'Refund processed successfully'
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}