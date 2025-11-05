import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency, customerEmail, customerName, receipt, notes } = body;

    // Validate required fields
    if (!amount || !currency || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For test environment, generate a mock Stripe session ID
    const mockSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return NextResponse.json({ 
      sessionId: mockSessionId,
      amount,
      currency,
      customerEmail,
      status: 'created'
    });

  } catch (error) {
    console.error('Error creating Stripe session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}