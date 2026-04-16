/**
 * Unit tests for Student Registration API Route
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 8.2, 8.5, 8.6
 */

import { POST } from "./route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextRequest } from "next/server";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    school: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock bcrypt
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
}));

describe("POST /api/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validRequestBody = {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    phone: "9876543210",
    selectedSchools: [
      {
        schoolId: "school1",
        programIds: ["prog1"],
      },
    ],
  };

  const mockSchool = {
    id: "school1",
    name: "School of Computer Science & Engineering",
    programs: [
      {
        id: "prog1",
        name: "B.Tech CSE",
        schoolId: "school1",
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(),
  };

  const mockUser = {
    id: "user123",
    name: "John Doe",
    email: "john@example.com",
    password: "hashedpassword",
    phone: "9876543210",
    role: "STUDENT",
    status: "PENDING",
    selectedSchools: [
      {
        schoolName: "School of Computer Science & Engineering",
        programName: "B.Tech CSE",
      },
    ],
    assignedSchool: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function createMockRequest(body: unknown): NextRequest {
    return {
      json: async () => body,
    } as NextRequest;
  }

  describe("Successful Registration", () => {
    it("should create a student with pending status", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.school.findUnique as jest.Mock).mockResolvedValue(mockSchool);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const request = createMockRequest(validRequestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.userId).toBe("user123");
      expect(data.message).toContain("admin approval");

      // Verify password was hashed with 10 rounds
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);

      // Verify user was created with correct data
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: "John Doe",
          email: "john@example.com",
          password: "hashedpassword",
          phone: "9876543210",
          role: "STUDENT",
          status: "PENDING",
          selectedSchools: [
            {
              schoolName: "School of Computer Science & Engineering",
              programName: "B.Tech CSE",
            },
          ],
        },
      });
    });

    it("should handle multiple schools and programs", async () => {
      const mockSchool2 = {
        id: "school2",
        name: "School of Business",
        programs: [
          {
            id: "prog2",
            name: "BBA",
            schoolId: "school2",
            createdAt: new Date(),
          },
          {
            id: "prog3",
            name: "MBA",
            schoolId: "school2",
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
      };

      const multiSchoolRequest = {
        ...validRequestBody,
        selectedSchools: [
          { schoolId: "school1", programIds: ["prog1"] },
          { schoolId: "school2", programIds: ["prog2", "prog3"] },
        ],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.school.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockSchool)
        .mockResolvedValueOnce(mockSchool2);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
      (prisma.user.create as jest.Mock).mockResolvedValue({
        ...mockUser,
        selectedSchools: [
          {
            schoolName: "School of Computer Science & Engineering",
            programName: "B.Tech CSE",
          },
          { schoolName: "School of Business", programName: "BBA" },
          { schoolName: "School of Business", programName: "MBA" },
        ],
      });

      const request = createMockRequest(multiSchoolRequest);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);

      // Verify selectedSchools JSON structure
      const createCall = (prisma.user.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.selectedSchools).toHaveLength(3);
      expect(createCall.data.selectedSchools).toEqual([
        {
          schoolName: "School of Computer Science & Engineering",
          programName: "B.Tech CSE",
        },
        { schoolName: "School of Business", programName: "BBA" },
        { schoolName: "School of Business", programName: "MBA" },
      ]);
    });
  });

  describe("Validation Errors", () => {
    it("should reject invalid email format", async () => {
      const request = createMockRequest({
        ...validRequestBody,
        email: "invalid-email",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toContain("Invalid email format");
    });

    it("should reject weak password", async () => {
      const request = createMockRequest({
        ...validRequestBody,
        password: "short",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toContain("Password must be at least 8 characters");
    });

    it("should reject invalid phone number", async () => {
      const request = createMockRequest({
        ...validRequestBody,
        phone: "123",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toContain(
        "Invalid phone number format (must be 10 digits)"
      );
    });

    it("should reject empty name", async () => {
      const request = createMockRequest({
        ...validRequestBody,
        name: "",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toContain("Name is required");
    });

    it("should reject empty school selection", async () => {
      const request = createMockRequest({
        ...validRequestBody,
        selectedSchools: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toContain("Select at least one school and one program");
    });

    it("should return multiple validation errors", async () => {
      const request = createMockRequest({
        name: "",
        email: "invalid",
        password: "short",
        phone: "123",
        selectedSchools: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toHaveLength(5);
    });
  });

  describe("Email Uniqueness", () => {
    it("should reject duplicate email", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const request = createMockRequest(validRequestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.message).toContain("already registered");
    });

    it("should handle Prisma P2002 error (unique constraint)", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.school.findUnique as jest.Mock).mockResolvedValue(mockSchool);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
      (prisma.user.create as jest.Mock).mockRejectedValue({
        code: "P2002",
        meta: { target: ["email"] },
      });

      const request = createMockRequest(validRequestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.message).toContain("already registered");
    });
  });

  describe("Invalid School/Program Data", () => {
    it("should reject invalid school ID", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.school.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");

      const request = createMockRequest(validRequestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain("Invalid school selected");
    });

    it("should reject invalid program ID", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.school.findUnique as jest.Mock).mockResolvedValue(mockSchool);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");

      const request = createMockRequest({
        ...validRequestBody,
        selectedSchools: [
          {
            schoolId: "school1",
            programIds: ["invalid-program-id"],
          },
        ],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain("Invalid program selected");
    });
  });

  describe("Error Handling", () => {
    it("should handle unexpected database errors", async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      const request = createMockRequest(validRequestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.message).toContain("Internal server error");
    });
  });
});
