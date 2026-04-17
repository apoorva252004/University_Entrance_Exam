import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Simplified middleware - auth checks are handled in individual pages
 * This is because NextAuth with bcrypt doesn't work well in Edge runtime
 */
export function middleware(request: NextRequest) {
  // Just pass through all requests
  return NextResponse.next();
}

// Don't run middleware on any routes
export const config = {
  matcher: [],
};
