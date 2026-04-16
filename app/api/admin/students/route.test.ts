import { GET } from "./route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Mock auth module before importing
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
    },
  },
}));

// Import mocked auth after mocking
const { auth } = require("@/lib/auth");

const mockAuth = auth as jest.MockedFunction<() => Promise<any>>;
const mockPrismaUserFindMany = prisma.user.findMany as jest.MockedFunction<
  typeof prisma.user.findMany
>;

describe("GET /api/admin/students", () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = new NextRequest("http://localhost:3000/api/admin/students");
  });

  describe("Authentication and Authorization", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain("Unauthorized");
    });

    it("should return 403 if user is not an admin", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "student123",
          email: "student@test.com",
          name: "Test Student",
          role: "STUDENT",
          status: "APPROVED",
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      });

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain("Forbidden");
      expect(data.error).toContain("Admin access required");
    });

    it("should return 403 if user is a teacher", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "teacher123",
          email: "teacher@test.com",
          name: "Test Teacher",
          role: "TEACHER",
          status: "APPROVED",
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      });

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain("Forbidden");
    });
  });

  describe("Successful Requests", () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin123",
          email: "admin@rvu.edu.in",
          name: "System Admin",
          role: "ADMIN",
          status: "APPROVED",
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      });
    });

    it("should return empty array when no pending students exist", async () => {
      mockPrismaUserFindMany.mockResolvedValue([]);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.students).toEqual([]);
      expect(mockPrismaUserFindMany).toHaveBeenCalledWith({
        where: {
          role: "STUDENT",
          status: "PENDING",
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          selectedSchools: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    });

    it("should return list of pending students with correct fields", async () => {
      const mockStudents = [
        {
          id: "student1",
          name: "John Doe",
          email: "john@test.com",
          phone: "9876543210",
          selectedSchools: [
            {
              schoolName: "School of Computer Science & Engineering",
              programName: "B.Tech CSE",
            },
            {
              schoolName: "School of Business",
              programName: "BBA",
            },
          ],
          createdAt: new Date("2024-01-15T10:00:00Z"),
        },
        {
          id: "student2",
          name: "Jane Smith",
          email: "jane@test.com",
          phone: "9876543211",
          selectedSchools: [
            {
              schoolName: "School of Law",
              programName: "BA LLB",
            },
          ],
          createdAt: new Date("2024-01-14T09:00:00Z"),
        },
      ];

      mockPrismaUserFindMany.mockResolvedValue(mockStudents);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.students).toHaveLength(2);
      expect(data.students[0]).toEqual({
        id: "student1",
        name: "John Doe",
        email: "john@test.com",
        phone: "9876543210",
        selectedSchools: [
          {
            schoolName: "School of Computer Science & Engineering",
            programName: "B.Tech CSE",
          },
          {
            schoolName: "School of Business",
            programName: "BBA",
          },
        ],
        createdAt: "2024-01-15T10:00:00.000Z",
      });
      expect(data.students[1]).toEqual({
        id: "student2",
        name: "Jane Smith",
        email: "jane@test.com",
        phone: "9876543211",
        selectedSchools: [
          {
            schoolName: "School of Law",
            programName: "BA LLB",
          },
        ],
        createdAt: "2024-01-14T09:00:00.000Z",
      });
    });

    it("should handle students with null selectedSchools", async () => {
      const mockStudents = [
        {
          id: "student1",
          name: "John Doe",
          email: "john@test.com",
          phone: "9876543210",
          selectedSchools: null,
          createdAt: new Date("2024-01-15T10:00:00Z"),
        },
      ];

      mockPrismaUserFindMany.mockResolvedValue(mockStudents);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.students[0].selectedSchools).toEqual([]);
    });

    it("should only return students with PENDING status", async () => {
      mockPrismaUserFindMany.mockResolvedValue([]);

      await GET(mockRequest);

      expect(mockPrismaUserFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            role: "STUDENT",
            status: "PENDING",
          },
        })
      );
    });

    it("should order students by createdAt descending", async () => {
      mockPrismaUserFindMany.mockResolvedValue([]);

      await GET(mockRequest);

      expect(mockPrismaUserFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            createdAt: "desc",
          },
        })
      );
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin123",
          email: "admin@rvu.edu.in",
          name: "System Admin",
          role: "ADMIN",
          status: "APPROVED",
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      });
    });

    it("should return 500 on database error", async () => {
      mockPrismaUserFindMany.mockRejectedValue(new Error("Database connection failed"));

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("Internal server error");
    });

    it("should log error on database failure", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const dbError = new Error("Database connection failed");
      mockPrismaUserFindMany.mockRejectedValue(dbError);

      await GET(mockRequest);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Admin students list error:",
        dbError
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
