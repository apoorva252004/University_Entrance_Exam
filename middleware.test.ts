import { NextRequest } from "next/server";
import { middleware } from "./middleware";
import { auth } from "@/lib/auth";

// Mock the auth function
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe("Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Public routes", () => {
    it("should allow access to /login without authentication", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest(new URL("http://localhost:3000/login"));
      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it("should allow access to /signup without authentication", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest(new URL("http://localhost:3000/signup"));
      const response = await middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe("Authentication requirement", () => {
    it("should redirect unauthenticated users to /login for /admin routes", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest(
        new URL("http://localhost:3000/admin/dashboard")
      );
      const response = await middleware(request);

      expect(response.status).toBe(307); // Redirect status
      expect(response.headers.get("location")).toBe(
        "http://localhost:3000/login"
      );
    });

    it("should redirect unauthenticated users to /login for /teacher routes", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest(
        new URL("http://localhost:3000/teacher/dashboard")
      );
      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "http://localhost:3000/login"
      );
    });

    it("should redirect unauthenticated users to /login for /student routes", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest(
        new URL("http://localhost:3000/student/dashboard")
      );
      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "http://localhost:3000/login"
      );
    });
  });

  describe("Admin routes", () => {
    it("should allow admin users to access /admin routes", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "1",
          role: "ADMIN",
          status: "APPROVED",
          email: "admin@test.com",
        },
        expires: "2024-12-31",
      });

      const request = new NextRequest(
        new URL("http://localhost:3000/admin/dashboard")
      );
      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it("should deny teacher access to /admin routes", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "2",
          role: "TEACHER",
          status: "APPROVED",
          email: "teacher@test.com",
        },
        expires: "2024-12-31",
      });

      const request = new NextRequest(
        new URL("http://localhost:3000/admin/dashboard")
      );
      const response = await middleware(request);

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error).toContain("Unauthorized");
    });

    it("should deny student access to /admin routes", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "3",
          role: "STUDENT",
          status: "APPROVED",
          email: "student@test.com",
        },
        expires: "2024-12-31",
      });

      const request = new NextRequest(
        new URL("http://localhost:3000/admin/dashboard")
      );
      const response = await middleware(request);

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error).toContain("Unauthorized");
    });
  });

  describe("Teacher routes", () => {
    it("should allow teacher users to access /teacher routes", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "2",
          role: "TEACHER",
          status: "APPROVED",
          email: "teacher@test.com",
        },
        expires: "2024-12-31",
      });

      const request = new NextRequest(
        new URL("http://localhost:3000/teacher/dashboard")
      );
      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it("should deny admin access to /teacher routes", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "1",
          role: "ADMIN",
          status: "APPROVED",
          email: "admin@test.com",
        },
        expires: "2024-12-31",
      });

      const request = new NextRequest(
        new URL("http://localhost:3000/teacher/dashboard")
      );
      const response = await middleware(request);

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error).toContain("Unauthorized");
    });

    it("should deny student access to /teacher routes", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "3",
          role: "STUDENT",
          status: "APPROVED",
          email: "student@test.com",
        },
        expires: "2024-12-31",
      });

      const request = new NextRequest(
        new URL("http://localhost:3000/teacher/dashboard")
      );
      const response = await middleware(request);

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error).toContain("Unauthorized");
    });
  });

  describe("Student routes", () => {
    it("should allow approved student users to access /student routes", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "3",
          role: "STUDENT",
          status: "APPROVED",
          email: "student@test.com",
        },
        expires: "2024-12-31",
      });

      const request = new NextRequest(
        new URL("http://localhost:3000/student/dashboard")
      );
      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it("should redirect pending students to /login", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "3",
          role: "STUDENT",
          status: "PENDING",
          email: "student@test.com",
        },
        expires: "2024-12-31",
      });

      const request = new NextRequest(
        new URL("http://localhost:3000/student/dashboard")
      );
      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "http://localhost:3000/login"
      );
    });

    it("should redirect rejected students to /login", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "3",
          role: "STUDENT",
          status: "REJECTED",
          email: "student@test.com",
        },
        expires: "2024-12-31",
      });

      const request = new NextRequest(
        new URL("http://localhost:3000/student/dashboard")
      );
      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "http://localhost:3000/login"
      );
    });

    it("should deny admin access to /student routes", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "1",
          role: "ADMIN",
          status: "APPROVED",
          email: "admin@test.com",
        },
        expires: "2024-12-31",
      });

      const request = new NextRequest(
        new URL("http://localhost:3000/student/dashboard")
      );
      const response = await middleware(request);

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error).toContain("Unauthorized");
    });

    it("should deny teacher access to /student routes", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "2",
          role: "TEACHER",
          status: "APPROVED",
          email: "teacher@test.com",
        },
        expires: "2024-12-31",
      });

      const request = new NextRequest(
        new URL("http://localhost:3000/student/dashboard")
      );
      const response = await middleware(request);

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error).toContain("Unauthorized");
    });
  });
});
