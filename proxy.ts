import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Robust proxy for route protection and role-based access control
 * Protects all private routes and enforces authentication
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/api/auth',
    '/api/register',
    '/api/schools',
  ];
  
  // Semi-public routes that require authentication but no role check
  const authOnlyRoutes = [
    '/change-password',
    '/api/change-password',
  ];
  
  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // Check if route requires auth only (no role check)
  const isAuthOnlyRoute = authOnlyRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Get session for protected routes
  const session = await auth();
  
  // Redirect to login if not authenticated
  if (!session || !session.user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  const user = session.user;
  
  // Allow auth-only routes (like change-password) without role check
  if (isAuthOnlyRoute) {
    return NextResponse.next();
  }
  
  // Force password change on first login (except for change-password page)
  if (user.isFirstLogin && pathname !== '/change-password') {
    return NextResponse.redirect(new URL('/change-password', request.url));
  }
  
  // Prevent access to change-password if not first login
  if (!user.isFirstLogin && pathname === '/change-password') {
    // Redirect to appropriate dashboard based on role
    const dashboardUrl = user.role === 'ADMIN' ? '/admin/dashboard' :
                        user.role === 'TEACHER' ? '/teacher/dashboard' :
                        '/student/dashboard';
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }
  
  // Role-based route protection
  const roleRoutes: Record<string, string[]> = {
    ADMIN: ['/admin', '/api/admin'],
    TEACHER: ['/teacher', '/api/teacher'],
    STUDENT: ['/student', '/exam', '/api/student'],
  };
  
  // Check if user has access to the route
  const userRole = user.role as string;
  const allowedRoutes = roleRoutes[userRole] || [];
  
  const hasAccess = allowedRoutes.some(route => pathname.startsWith(route));
  
  // Block access if user doesn't have permission
  if (!hasAccess && pathname !== '/change-password' && pathname !== '/api/change-password') {
    // Return 403 Forbidden
    return new NextResponse(
      JSON.stringify({ error: 'Forbidden: You do not have access to this resource' }),
      { status: 403, headers: { 'content-type': 'application/json' } }
    );
  }
  
  // Allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)',
  ],
};
