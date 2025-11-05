import { NextRequest, NextResponse } from 'next/server';

// Razorpay credentials should come from environment variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency, receipt, notes, gateway, environment } = body;

    // Validate required fields
    if (!amount || !currency || !receipt) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, currency, receipt' },
        { status: 400 }
      );
    }

    if (gateway !== 'razorpay') {
      return NextResponse.json(
        { error: 'Only Razorpay gateway is currently supported' },
        { status: 400 }
      );
    }

    // Validate env credentials
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Razorpay credentials missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' },
        { status: 500 }
      );
    }

    // Create order on Razorpay (works with test keys in sandbox)
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    const rpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        amount, // amount in paise
        currency, // 'INR'
        receipt,
        notes: notes || {}
      })
    });

    if (!rpResponse.ok) {
      const errText = await rpResponse.text();
      return NextResponse.json(
        { error: 'Failed to create Razorpay order', details: errText },
        { status: 400 }
      );
    }

    const rpOrder = await rpResponse.json();
    // rpOrder.id is like 'order_XXXXXXXXXXXX'
    return NextResponse.json({
      orderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      status: rpOrder.status || 'created'
    });

  } catch (error) {
    console.error('Error creating payment order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}