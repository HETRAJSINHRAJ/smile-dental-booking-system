/**
 * Rate Limiting Module
 * 
 * Provides Redis-based rate limiting for API routes using Upstash.
 * Implements different rate limits for various endpoint types:
 * - Authentication: 5 attempts per 15 minutes per IP
 * - Notifications: 10 requests per hour per user
 * - Payments: 3 attempts per hour per user
 * - Receipts: 5 requests per hour per user
 * 
 * @module lib/ratelimit
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';
import { auditLogger } from '@/lib/audit';

// Initialize Redis client
// Falls back to a mock implementation if credentials are not provided
let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (error) {
  console.warn('Failed to initialize Redis client for rate limiting:', error);
}

/**
 * Rate limit configurations for different endpoint types
 */
export const rateLimitConfigs = {
  // Authentication: 5 attempts per 15 minutes per IP
  auth: {
    requests: 5,
    window: '15 m' as const,
    prefix: 'ratelimit:auth',
  },
  // Notifications: 10 requests per hour per user
  notifications: {
    requests: 10,
    window: '1 h' as const,
    prefix: 'ratelimit:notifications',
  },
  // Payments: 3 attempts per hour per user
  payments: {
    requests: 3,
    window: '1 h' as const,
    prefix: 'ratelimit:payments',
  },
  // Receipts: 5 requests per hour per user
  receipts: {
    requests: 5,
    window: '1 h' as const,
    prefix: 'ratelimit:receipts',
  },
  // Default: 100 requests per minute
  default: {
    requests: 100,
    window: '1 m' as const,
    prefix: 'ratelimit:default',
  },
};

export type RateLimitType = keyof typeof rateLimitConfigs;

/**
 * Create a rate limiter instance for a specific endpoint type
 */
function createRateLimiter(type: RateLimitType): Ratelimit | null {
  if (!redis) {
    return null;
  }

  const config = rateLimitConfigs[type];
  
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    prefix: config.prefix,
    analytics: true,
  });
}

// Create rate limiters for each type
const rateLimiters: Record<RateLimitType, Ratelimit | null> = {
  auth: createRateLimiter('auth'),
  notifications: createRateLimiter('notifications'),
  payments: createRateLimiter('payments'),
  receipts: createRateLimiter('receipts'),
  default: createRateLimiter('default'),
};

/**
 * Rate limit result interface
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: NextRequest): string {
  // Check various headers for the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a default value
  return '127.0.0.1';
}

/**
 * Check rate limit for a request
 * 
 * @param identifier - Unique identifier (IP address or user ID)
 * @param type - Type of rate limit to apply
 * @returns Rate limit result
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'default'
): Promise<RateLimitResult> {
  const rateLimiter = rateLimiters[type];
  const config = rateLimitConfigs[type];
  
  // If rate limiter is not available (no Redis), allow all requests
  if (!rateLimiter) {
    console.warn(`Rate limiter not available for type: ${type}. Allowing request.`);
    return {
      success: true,
      limit: config.requests,
      remaining: config.requests,
      reset: Date.now() + 60000,
    };
  }

  try {
    const result = await rateLimiter.limit(identifier);
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // On error, allow the request but log the issue
    return {
      success: true,
      limit: config.requests,
      remaining: config.requests,
      reset: Date.now() + 60000,
    };
  }
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toString());
  return response;
}

/**
 * Create a rate-limited response (429 Too Many Requests)
 */
export function createRateLimitedResponse(result: RateLimitResult): NextResponse {
  const response = NextResponse.json(
    {
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
    },
    { status: 429 }
  );
  
  addRateLimitHeaders(response, result);
  response.headers.set('Retry-After', Math.ceil((result.reset - Date.now()) / 1000).toString());
  
  return response;
}

/**
 * Log rate limit violation to audit logs
 */
export async function logRateLimitViolation(
  identifier: string,
  type: RateLimitType,
  ipAddress: string,
  userAgent: string,
  endpoint: string
): Promise<void> {
  try {
    await auditLogger.logAction({
      userId: identifier,
      userName: 'Rate Limited User',
      userEmail: 'unknown',
      userRole: 'patient',
      action: 'rate_limit_exceeded' as any,
      resource: 'api',
      resourceId: endpoint,
      description: `Rate limit exceeded for ${type} endpoint: ${endpoint}`,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error('Failed to log rate limit violation:', error);
  }
}

/**
 * Rate limiting middleware for API routes
 * 
 * @param request - Next.js request object
 * @param type - Type of rate limit to apply
 * @param identifier - Optional custom identifier (defaults to IP for auth, user ID for others)
 * @returns null if allowed, NextResponse if rate limited
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  type: RateLimitType,
  identifier?: string
): Promise<{ allowed: boolean; response?: NextResponse; result: RateLimitResult }> {
  const ipAddress = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const endpoint = request.nextUrl.pathname;
  
  // Use IP for auth endpoints, provided identifier or IP for others
  const rateLimitIdentifier = type === 'auth' 
    ? ipAddress 
    : (identifier || ipAddress);
  
  const result = await checkRateLimit(rateLimitIdentifier, type);
  
  if (!result.success) {
    // Log the violation
    await logRateLimitViolation(
      rateLimitIdentifier,
      type,
      ipAddress,
      userAgent,
      endpoint
    );
    
    return {
      allowed: false,
      response: createRateLimitedResponse(result),
      result,
    };
  }
  
  return {
    allowed: true,
    result,
  };
}

/**
 * Higher-order function to wrap API route handlers with rate limiting
 * 
 * @param handler - The API route handler function
 * @param type - Type of rate limit to apply
 * @param getIdentifier - Optional function to extract identifier from request
 * @returns Wrapped handler with rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  type: RateLimitType,
  getIdentifier?: (request: NextRequest) => string | undefined
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const identifier = getIdentifier ? getIdentifier(request) : undefined;
    const { allowed, response, result } = await rateLimitMiddleware(request, type, identifier);
    
    if (!allowed && response) {
      return response;
    }
    
    // Call the original handler
    const handlerResponse = await handler(request);
    
    // Add rate limit headers to successful responses
    addRateLimitHeaders(handlerResponse, result);
    
    return handlerResponse;
  };
}

export default {
  checkRateLimit,
  rateLimitMiddleware,
  withRateLimit,
  addRateLimitHeaders,
  createRateLimitedResponse,
  getClientIp,
  rateLimitConfigs,
};
