import { Session } from "next-auth";

// Define role and status types based on the database schema
type Role = "ADMIN" | "TEACHER" | "STUDENT";
type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

/**
 * Check if the user has an admin role
 * @param role - The user's role
 * @returns true if the user is an admin
 */
export function isAdmin(role: Role): boolean {
  return role === "ADMIN";
}

/**
 * Check if the user has a teacher role
 * @param role - The user's role
 * @returns true if the user is a teacher
 */
export function isTeacher(role: Role): boolean {
  return role === "TEACHER";
}

/**
 * Check if the user has a student role
 * @param role - The user's role
 * @returns true if the user is a student
 */
export function isStudent(role: Role): boolean {
  return role === "STUDENT";
}

/**
 * Check if a user can access a specific route based on their role and status
 * @param session - The user's session (null if not authenticated)
 * @param path - The route path to check
 * @returns true if the user can access the route, false otherwise
 */
export function canAccessRoute(
  session: Session | null,
  path: string
): boolean {
  // Public routes - accessible without authentication
  const publicRoutes = ["/", "/login", "/signup"];
  if (publicRoutes.includes(path) || path.startsWith("/api/auth")) {
    return true;
  }

  // Require authentication for all other routes
  if (!session || !session.user) {
    return false;
  }

  const { role, status } = session.user;

  // Admin routes - only accessible by admins
  if (path.startsWith("/admin")) {
    return isAdmin(role as Role);
  }

  // Teacher routes - only accessible by teachers
  if (path.startsWith("/teacher")) {
    return isTeacher(role as Role);
  }

  // Student routes - only accessible by approved students
  if (path.startsWith("/student")) {
    return isStudent(role as Role) && status === "APPROVED";
  }

  // API routes - check based on route prefix
  if (path.startsWith("/api/admin")) {
    return isAdmin(role as Role);
  }

  if (path.startsWith("/api/teacher")) {
    return isTeacher(role as Role);
  }

  if (path.startsWith("/api/student")) {
    return isStudent(role as Role) && status === "APPROVED";
  }

  // Default: allow access to other routes if authenticated
  return true;
}
