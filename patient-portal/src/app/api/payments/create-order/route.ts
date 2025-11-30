import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimitMiddleware, addRateLimitHeaders } from '@/lib/ratelimit';
import { validateInput, formatZodErrors, sanitizeText } from '@/lib/validation';

// Razorpay credentials should come from environment variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Zod schema for create order request
const createOrderSchema = z.object({
  amount: z.number().positive('Amount must be positive').int('Amount must be in paise (integer)'),
  currency: z.enum(['INR']).default('INR'),
  receipt: z.string().min(1, 'Receipt ID is required').max(40, 'Receipt ID is too long'),
  notes: z.record(z.string()).optional(),
  gateway: z.enum(['razorpay']),
  environment: z.enum(['test', 'live']).optional(),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input using Zod schema
    const validation = validateInput(createOrderSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: formatZodErrors(validation.errors!) 
        },
        { status: 400 }
      );
    }

    const { amount, currency, receipt, notes, gateway, userId } = validation.data!;

    // Apply rate limiting (3 attempts per hour per user)
    const rateLimitIdentifier = userId || receipt || 'anonymous';
    const { allowed, response, result } = await rateLimitMiddleware(
      request,
      'payments',
      rateLimitIdentifier
    );
    
    if (!allowed && response) {
      return response;
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
    const successResponse = NextResponse.json({
      orderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      status: rpOrder.status || 'created'
    });
    
    // Add rate limit headers to successful response
    addRateLimitHeaders(successResponse, result);
    
    return successResponse;

  } catch (error) {
    console.error('Error creating payment order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}