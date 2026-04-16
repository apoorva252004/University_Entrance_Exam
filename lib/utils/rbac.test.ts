import { describe, test, expect } from "@jest/globals";
import { isAdmin, isTeacher, isStudent, canAccessRoute } from "./rbac";
import { Role, ApplicationStatus } from "@prisma/client";
import { Session } from "next-auth";

describe("RBAC Utility Functions", () => {
  describe("isAdmin", () => {
    test("returns true for ADMIN role", () => {
      expect(isAdmin("ADMIN" as Role)).toBe(true);
    });

    test("returns false for TEACHER role", () => {
      expect(isAdmin("TEACHER" as Role)).toBe(false);
    });

    test("returns false for STUDENT role", () => {
      expect(isAdmin("STUDENT" as Role)).toBe(false);
    });
  });

  describe("isTeacher", () => {
    test("returns true for TEACHER role", () => {
      expect(isTeacher("TEACHER" as Role)).toBe(true);
    });

    test("returns false for ADMIN role", () => {
      expect(isTeacher("ADMIN" as Role)).toBe(false);
    });

    test("returns false for STUDENT role", () => {
      expect(isTeacher("STUDENT" as Role)).toBe(false);
    });
  });

  describe("isStudent", () => {
    test("returns true for STUDENT role", () => {
      expect(isStudent("STUDENT" as Role)).toBe(true);
    });

    test("returns false for ADMIN role", () => {
      expect(isStudent("ADMIN" as Role)).toBe(false);
    });

    test("returns false for TEACHER role", () => {
      expect(isStudent("TEACHER" as Role)).toBe(false);
    });
  });

  describe("canAccessRoute", () => {
    // Helper to create mock sessions
    const createSession = (
      role: Role,
      status: ApplicationStatus = "APPROVED"
    ): Session => ({
      user: {
        id: "test-id",
        name: "Test User",
        email: "test@example.com",
        role,
        status,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    describe("Public routes", () => {
      test("allows unauthenticated access to /", () => {
        expect(canAccessRoute(null, "/")).toBe(true);
      });

      test("allows unauthenticated access to /login", () => {
        expect(canAccessRoute(null, "/login")).toBe(true);
      });

      test("allows unauthenticated access to /signup", () => {
        expect(canAccessRoute(null, "/signup")).toBe(true);
      });

      test("allows unauthenticated access to /api/auth routes", () => {
        expect(canAccessRoute(null, "/api/auth/signin")).toBe(true);
        expect(canAccessRoute(null, "/api/auth/callback")).toBe(true);
      });
    });

    describe("Admin routes", () => {
      test("allows admin to access /admin routes", () => {
        const session = createSession("ADMIN");
        expect(canAccessRoute(session, "/admin/dashboard")).toBe(true);
        expect(canAccessRoute(session, "/admin/students")).toBe(true);
      });

      test("denies teacher access to /admin routes", () => {
        const session = createSession("TEACHER");
        expect(canAccessRoute(session, "/admin/dashboard")).toBe(false);
      });

      test("denies student access to /admin routes", () => {
        const session = createSession("STUDENT");
        expect(canAccessRoute(session, "/admin/dashboard")).toBe(false);
      });

      test("denies unauthenticated access to /admin routes", () => {
        expect(canAccessRoute(null, "/admin/dashboard")).toBe(false);
      });
    });

    describe("Teacher routes", () => {
      test("allows teacher to access /teacher routes", () => {
        const session = createSession("TEACHER");
        expect(canAccessRoute(session, "/teacher/dashboard")).toBe(true);
        expect(canAccessRoute(session, "/teacher/students")).toBe(true);
      });

      test("denies admin access to /teacher routes", () => {
        const session = createSession("ADMIN");
        expect(canAccessRoute(session, "/teacher/dashboard")).toBe(false);
      });

      test("denies student access to /teacher routes", () => {
        const session = createSession("STUDENT");
        expect(canAccessRoute(session, "/teacher/dashboard")).toBe(false);
      });

      test("denies unauthenticated access to /teacher routes", () => {
        expect(canAccessRoute(null, "/teacher/dashboard")).toBe(false);
      });
    });

    describe("Student routes", () => {
      test("allows approved student to access /student routes", () => {
        const session = createSession("STUDENT", "APPROVED");
        expect(canAccessRoute(session, "/student/dashboard")).toBe(true);
      });

      test("denies pending student access to /student routes", () => {
        const session = createSession("STUDENT", "PENDING");
        expect(canAccessRoute(session, "/student/dashboard")).toBe(false);
      });

      test("denies rejected student access to /student routes", () => {
        const session = createSession("STUDENT", "REJECTED");
        expect(canAccessRoute(session, "/student/dashboard")).toBe(false);
      });

      test("denies admin access to /student routes", () => {
        const session = createSession("ADMIN");
        expect(canAccessRoute(session, "/student/dashboard")).toBe(false);
      });

      test("denies teacher access to /student routes", () => {
        const session = createSession("TEACHER");
        expect(canAccessRoute(session, "/student/dashboard")).toBe(false);
      });

      test("denies unauthenticated access to /student routes", () => {
        expect(canAccessRoute(null, "/student/dashboard")).toBe(false);
      });
    });

    describe("API routes", () => {
      test("allows admin to access /api/admin routes", () => {
        const session = createSession("ADMIN");
        expect(canAccessRoute(session, "/api/admin/approve")).toBe(true);
        expect(canAccessRoute(session, "/api/admin/students")).toBe(true);
      });

      test("denies non-admin access to /api/admin routes", () => {
        const teacherSession = createSession("TEACHER");
        const studentSession = createSession("STUDENT");
        expect(canAccessRoute(teacherSession, "/api/admin/approve")).toBe(
          false
        );
        expect(canAccessRoute(studentSession, "/api/admin/approve")).toBe(
          false
        );
      });

      test("allows teacher to access /api/teacher routes", () => {
        const session = createSession("TEACHER");
        expect(canAccessRoute(session, "/api/teacher/students")).toBe(true);
      });

      test("denies non-teacher access to /api/teacher routes", () => {
        const adminSession = createSession("ADMIN");
        const studentSession = createSession("STUDENT");
        expect(canAccessRoute(adminSession, "/api/teacher/students")).toBe(
          false
        );
        expect(canAccessRoute(studentSession, "/api/teacher/students")).toBe(
          false
        );
      });

      test("allows approved student to access /api/student routes", () => {
        const session = createSession("STUDENT", "APPROVED");
        expect(canAccessRoute(session, "/api/student/exams")).toBe(true);
      });

      test("denies pending student access to /api/student routes", () => {
        const session = createSession("STUDENT", "PENDING");
        expect(canAccessRoute(session, "/api/student/exams")).toBe(false);
      });
    });

    describe("Other authenticated routes", () => {
      test("allows authenticated users to access non-role-specific routes", () => {
        const adminSession = createSession("ADMIN");
        const teacherSession = createSession("TEACHER");
        const studentSession = createSession("STUDENT");

        expect(canAccessRoute(adminSession, "/profile")).toBe(true);
        expect(canAccessRoute(teacherSession, "/profile")).toBe(true);
        expect(canAccessRoute(studentSession, "/profile")).toBe(true);
      });

      test("denies unauthenticated access to non-public routes", () => {
        expect(canAccessRoute(null, "/profile")).toBe(false);
        expect(canAccessRoute(null, "/settings")).toBe(false);
      });
    });
  });
});
