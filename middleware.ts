import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Simplified middleware for Next.js 16
 * Auth checks are handled in individual pages due to Edge runtime limitations
 */
export function middleware(request: NextRequest) {
  // Just pass through - auth is handled in pages
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

