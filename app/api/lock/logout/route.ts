import { NextRequest, NextResponse } from 'next/server';
import { LOCK_COOKIE } from '@/lib/site-lock';

// GET /api/lock/logout — clears the preview cookie and redirects to /lock
// Useful for resetting preview access during testing.
export function GET(request: NextRequest) {
  const lockUrl  = new URL('/lock', request.url);
  const response = NextResponse.redirect(lockUrl);
  response.cookies.delete(LOCK_COOKIE);
  return response;
}
