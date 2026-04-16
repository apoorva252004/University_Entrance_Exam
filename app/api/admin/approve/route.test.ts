import { NextRequest } from "next/server";
import { PATCH } from "./route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Mock dependencies
jest.mock("@/lib/auth");
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("PATCH /api/admin/approve", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Authentication and Authorization", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/admin/approve", {
        method: "PATCH",
        body: JSON.stringify({ studentId: "123", action: "approve" }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain("Unauthorized");
    });

    it("should return 403 if user is not an admin", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "teacher-1",
          role: "TEACHER",
          status: "APPROVED",
          email: "teacher@test.com",
          name: "Teacher",
        },
        expires: "2024-12-31",
      });

      const request = new NextRequest("http://localhost:3000/api/admin/approve", {
        method: "PATCH",
        body: JSON.stringify({ studentId: "123", action: "approve" }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain("Forbidden");
    });
  });

  describe("Request Validation", () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-1",
          role: "ADMIN",
          status: "APPROVED",
          email: "admin@test.com",
          name: "Admin",
        },
        expires: "2024-12-31",
      });
    });

    it("should return 400 if request body is invalid JSON", async () => {
      const request = new NextRequest("http://localhost:3000/api/admin/approve", {
        method: "PATCH",
        body: "invalid json",
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Invalid JSON");
    });

    it("should return 400 if studentId is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/admin/approve", {
        method: "PATCH",
        body: JSON.stringify({ action: "approve" }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("studentId is required");
    });

    it("should return 400 if action is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/admin/approve", {
        method: "PATCH",
        body: JSON.stringify({ studentId: "123" }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("action is required");
    });

    it("should return 400 if action is invalid", async () => {
      const request = new NextRequest("http://localhost:3000/api/admin/approve", {
        method: "PATCH",
        body: JSON.stringify({ studentId: "123", action: "invalid" }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('must be either "approve" or "reject"');
    });
  });

  describe("Student Validation", () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-1",
          role: "ADMIN",
          status: "APPROVED",
          email: "admin@test.com",
          name: "Admin",
        },
        expires: "2024-12-31",
      });
    });

    it("should return 404 if student does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/admin/approve", {
        method: "PATCH",
        body: JSON.stringify({ studentId: "nonexistent", action: "approve" }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Student not found");
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "nonexistent" },
        select: {
          id: true,
          role: true,
          status: true,
        },
      });
    });

    it("should return 400 if user is not a student", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "teacher-1",
        role: "TEACHER",
        status: "APPROVED",
      });

      const request = new NextRequest("http://localhost:3000/api/admin/approve", {
        method: "PATCH",
        body: JSON.stringify({ studentId: "teacher-1", action: "approve" }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("User is not a student");
    });
  });

  describe("Approval Actions", () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-1",
          role: "ADMIN",
          status: "APPROVED",
          email: "admin@test.com",
          name: "Admin",
        },
        expires: "2024-12-31",
      });

      mockPrisma.user.findUnique.mockResolvedValue({
        id: "student-1",
        role: "STUDENT",
        status: "PENDING",
      });
    });

    it("should approve a student successfully", async () => {
      mockPrisma.user.update.mockResolvedValue({
        id: "student-1",
        name: "Student",
        email: "student@test.com",
        password: "hashed",
        phone: "1234567890",
        role: "STUDENT",
        status: "APPROVED",
        selectedSchools: [],
        assignedSchool: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest("http://localhost:3000/api/admin/approve", {
        method: "PATCH",
        body: JSON.stringify({ studentId: "student-1", action: "approve" }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain("approved successfully");
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "student-1" },
        data: {
          status: "APPROVED",
        },
      });
    });

    it("should reject a student successfully", async () => {
      mockPrisma.user.update.mockResolvedValue({
        id: "student-1",
        name: "Student",
        email: "student@test.com",
        password: "hashed",
        phone: "1234567890",
        role: "STUDENT",
        status: "REJECTED",
        selectedSchools: [],
        assignedSchool: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest("http://localhost:3000/api/admin/approve", {
        method: "PATCH",
        body: JSON.stringify({ studentId: "student-1", action: "reject" }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain("rejected successfully");
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "student-1" },
        data: {
          status: "REJECTED",
        },
      });
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-1",
          role: "ADMIN",
          status: "APPROVED",
          email: "admin@test.com",
          name: "Admin",
        },
        expires: "2024-12-31",
      });

      mockPrisma.user.findUnique.mockResolvedValue({
        id: "student-1",
        role: "STUDENT",
        status: "PENDING",
      });
    });

    it("should return 500 if database update fails", async () => {
      mockPrisma.user.update.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest("http://localhost:3000/api/admin/approve", {
        method: "PATCH",
        body: JSON.stringify({ studentId: "student-1", action: "approve" }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("Internal server error");
    });
  });
});
