/**
 * Request Utilities for Audit Logging
 * 
 * Helper functions to extract metadata from HTTP requests
 * for audit logging purposes.
 */

import { NextRequest } from 'next/server';

/**
 * Extract IP address from request headers
 * Handles various proxy headers (Vercel, Cloudflare, etc.)
 */
export function getIpAddress(request: NextRequest | Request): string {
  if ('headers' in request) {
    // Check common proxy headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return forwardedFor.split(',')[0].trim();
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
      return realIp;
    }

    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    if (cfConnectingIp) {
      return cfConnectingIp;
    }

    // Vercel-specific header
    const vercelForwardedFor = request.headers.get('x-vercel-forwarded-for');
    if (vercelForwardedFor) {
      return vercelForwardedFor.split(',')[0].trim();
    }
  }

  return 'unknown';
}

/**
 * Extract user agent from request headers
 */
export function getUserAgent(request: NextRequest | Request): string {
  if ('headers' in request) {
    return request.headers.get('user-agent') || 'unknown';
  }
  return 'unknown';
}

/**
 * Extract both IP and user agent from request
 */
export function getRequestMetadata(request: NextRequest | Request): {
  ipAddress: string;
  userAgent: string;
} {
  return {
    ipAddress: getIpAddress(request),
    userAgent: getUserAgent(request),
  };
}

/**
 * Client-side function to get user agent
 * (IP address cannot be reliably obtained on client-side)
 */
export function getClientUserAgent(): string {
  if (typeof window !== 'undefined' && window.navigator) {
    return window.navigator.userAgent;
  }
  return 'unknown';
}
