/**
 * CSRF Token Validation Utilities
 * 
 * Provides CSRF protection for state-changing API routes.
 * Uses a double-submit cookie pattern with signed tokens.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// ============================================================================
// Configuration
// ============================================================================

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Generates a new CSRF token
 */
export function generateCSRFToken(): string {
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const payload = `${timestamp}.${randomBytes}`;
  
  // Sign the token
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('hex');
  
  return `${payload}.${signature}`;
}

/**
 * Validates a CSRF token
 */
export function validateCSRFToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  const [timestamp, randomBytes, signature] = parts;
  const payload = `${timestamp}.${randomBytes}`;
  
  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('hex');
  
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return false;
  }
  
  // Check expiry
  const tokenTime = parseInt(timestamp, 36);
  if (Date.now() - tokenTime > TOKEN_EXPIRY_MS) {
    return false;
  }
  
  return true;
}

// ============================================================================
// Middleware Functions
// ============================================================================

/**
 * CSRF validation middleware for API routes
 * Use this for state-changing operations (POST, PUT, DELETE, PATCH)
 */
export async function validateCSRFMiddleware(
  request: NextRequest
): Promise<{ valid: boolean; error?: string }> {
  // Skip CSRF validation for safe methods
  const safeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(request.method);
  if (safeMethod) {
    return { valid: true };
  }
  
  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  
  // Get token from cookie
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  
  // Both tokens must be present
  if (!headerToken) {
    return { valid: false, error: 'Missing CSRF token in header' };
  }
  
  if (!cookieToken) {
    return { valid: false, error: 'Missing CSRF token in cookie' };
  }
  
  // Tokens must match (double-submit pattern)
  if (headerToken !== cookieToken) {
    return { valid: false, error: 'CSRF token mismatch' };
  }
  
  // Validate token signature and expiry
  if (!validateCSRFToken(headerToken)) {
    return { valid: false, error: 'Invalid or expired CSRF token' };
  }
  
  return { valid: true };
}

/**
 * Creates a CSRF error response
 */
export function createCSRFErrorResponse(error: string): NextResponse {
  return NextResponse.json(
    { 
      error: 'CSRF validation failed',
      message: error,
      code: 'CSRF_ERROR'
    },
    { status: 403 }
  );
}

/**
 * Sets CSRF cookie in response
 */
export function setCSRFCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: TOKEN_EXPIRY_MS / 1000,
  });
  
  return response;
}

// ============================================================================
// Higher-Order Function for Protected Routes
// ============================================================================

/**
 * Wraps an API route handler with CSRF protection
 * 
 * Usage:
 * ```typescript
 * export const POST = withCSRFProtection(async (request) => {
 *   // Your handler code
 * });
 * ```
 */
export function withCSRFProtection(
  handler: (request: NextRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const { valid, error } = await validateCSRFMiddleware(request);
    
    if (!valid) {
      return createCSRFErrorResponse(error || 'CSRF validation failed');
    }
    
    return handler(request);
  };
}

// ============================================================================
// Client-Side Helpers
// ============================================================================

/**
 * Gets the CSRF token from cookie (for client-side use)
 * This should be called from a client component
 */
export function getCSRFTokenFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }
  
  return null;
}

/**
 * Creates headers object with CSRF token
 * Use this when making fetch requests
 */
export function createCSRFHeaders(additionalHeaders?: HeadersInit): HeadersInit {
  const token = getCSRFTokenFromCookie();
  
  return {
    ...additionalHeaders,
    [CSRF_HEADER_NAME]: token || '',
  };
}

// ============================================================================
// API Route for Token Generation
// ============================================================================

/**
 * Handler for generating new CSRF tokens
 * Mount this at /api/csrf/token
 */
export async function handleCSRFTokenRequest(): Promise<NextResponse> {
  const token = generateCSRFToken();
  
  const response = NextResponse.json({ 
    success: true,
    message: 'CSRF token generated'
  });
  
  return setCSRFCookie(response, token);
}

// ============================================================================
// Export
// ============================================================================

export const csrf = {
  generate: generateCSRFToken,
  validate: validateCSRFToken,
  middleware: validateCSRFMiddleware,
  withProtection: withCSRFProtection,
  getToken: getCSRFTokenFromCookie,
  createHeaders: createCSRFHeaders,
  handleTokenRequest: handleCSRFTokenRequest,
  errorResponse: createCSRFErrorResponse,
  setCookie: setCSRFCookie,
  COOKIE_NAME: CSRF_COOKIE_NAME,
  HEADER_NAME: CSRF_HEADER_NAME,
};

export default csrf;
