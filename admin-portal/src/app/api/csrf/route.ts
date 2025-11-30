/**
 * CSRF Token API Route
 * 
 * Generates and returns a new CSRF token for client-side use.
 * The token is set as a cookie and returned in the response.
 */

import { handleCSRFTokenRequest } from '@/lib/validation/csrf';

export async function GET() {
  return handleCSRFTokenRequest();
}
