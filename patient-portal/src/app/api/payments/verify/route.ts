import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, orderId, signature, amount, gateway } = body;

    // Validate required fields
    if (!paymentId || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentId, orderId' },
        { status: 400 }
      );
    }

    // Only Razorpay verification implemented for now
    let isVerified = false;
    if (gateway === 'razorpay') {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        return NextResponse.json(
          { error: 'Missing RAZORPAY_KEY_SECRET on server' },
          { status: 500 }
        );
      }
      const payload = `${orderId}|${paymentId}`;
      const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      isVerified = expectedSignature === signature;
    } else {
      // Fallback for other gateways (not implemented)
      isVerified = false;
    }
    
    return NextResponse.json({ 
      verified: isVerified,
      paymentId,
      orderId,
      message: isVerified ? 'Payment verified successfully' : 'Payment verification failed'
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}