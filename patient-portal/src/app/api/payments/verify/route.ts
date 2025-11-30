import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { rateLimitMiddleware, addRateLimitHeaders } from '@/lib/ratelimit';
import { validateInput, formatZodErrors } from '@/lib/validation';

// Zod schema for payment verification request
const verifyPaymentSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  orderId: z.string().min(1, 'Order ID is required'),
  signature: z.string().min(1, 'Signature is required'),
  amount: z.number().positive().optional(),
  gateway: z.enum(['razorpay']).default('razorpay'),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input using Zod schema
    const validation = validateInput(verifyPaymentSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: formatZodErrors(validation.errors!) 
        },
        { status: 400 }
      );
    }

    const { paymentId, orderId, signature, gateway, userId } = validation.data!;

    // Apply rate limiting (3 attempts per hour per user)
    const rateLimitIdentifier = userId || orderId || 'anonymous';
    const { allowed, response, result } = await rateLimitMiddleware(
      request,
      'payments',
      rateLimitIdentifier
    );
    
    if (!allowed && response) {
      return response;
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
    
    const successResponse = NextResponse.json({ 
      verified: isVerified,
      paymentId,
      orderId,
      message: isVerified ? 'Payment verified successfully' : 'Payment verification failed'
    });
    
    // Add rate limit headers to successful response
    addRateLimitHeaders(successResponse, result);
    
    return successResponse;

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}