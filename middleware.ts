import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Next.js Middleware for role-based route protection
 * 
 * Requirements:
 * - 6.1: Redirect unauthenticated users to /login
 * - 6.2: Redirect unauthenticated users attempting to access protected routes
 * - 6.3: Redirect unauthenticated users attempting to access protected routes
 * - 6.4: Deny access to students attempting to access admin/teacher routes
 * - 6.5: Deny access to teachers attempting to access admin/student routes
 * - 6.6: Deny access to admins attempting to access teacher/student routes
 * - 2.3: Prevent pending students from accessing dashboard
 * - 5.1: Only allow approved students to access student dashboard
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - allow access without authentication
  if (pathname === "/login" || pathname === "/signup") {
    return NextResponse.next();
  }

  // Get the session
  const session = await auth();

  // Require authentication for all protected routes
  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { role, status } = session.user;

  // Admin routes - only accessible by admins
  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // Teacher routes - only accessible by teachers
  if (pathname.startsWith("/teacher")) {
    if (role !== "TEACHER") {
      return NextResponse.json(
        { error: "Unauthorized: Teacher access required" },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // Student routes - only accessible by approved students
  if (pathname.startsWith("/student")) {
    if (role !== "STUDENT") {
      return NextResponse.json(
        { error: "Unauthorized: Student access required" },
        { status: 403 }
      );
    }
    if (status !== "APPROVED") {
      // Redirect pending/rejected students to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
};
