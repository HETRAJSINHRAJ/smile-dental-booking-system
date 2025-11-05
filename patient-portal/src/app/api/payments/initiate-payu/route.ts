import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, amount, productinfo, firstname, email, phone, surl, furl, environment } = body;

    // Validate required fields
    if (!key || !amount || !productinfo || !firstname || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For test environment, generate mock PayU data
    const mockTxnId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockPaymentUrl = `${request.nextUrl.origin}/payment/payu-redirect?txnid=${mockTxnId}`;
    
    return NextResponse.json({ 
      txnid: mockTxnId,
      paymentUrl: mockPaymentUrl,
      amount,
      status: 'initiated'
    });

  } catch (error) {
    console.error('Error initiating PayU payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}