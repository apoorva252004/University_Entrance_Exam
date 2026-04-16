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
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

// Import mocked auth after mocking
const { auth } = require("@/lib/auth");

const mockAuth = auth as jest.MockedFunction<() => Promise<any>>;
const mockPrismaUserFindUnique = prisma.user.findUnique as jest.MockedFunction<
  typeof prisma.user.findUnique
>;
const mockPrismaUserFindMany = prisma.user.findMany as jest.MockedFunction<
  typeof prisma.user.findMany
>;

describe("GET /api/teacher/students", () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = new NextRequest("http://localhost:3000/api/teacher/students");
  });

  describe("Authentication and Authorization", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain("Unauthorized");
    });

    it("should return 403 if user is not a teacher", async () => {
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
      expect(data.error).toContain("Teacher access required");
    });

    it("should return 403 if user is an admin", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin123",
          email: "admin@test.com",
          name: "Test Admin",
          role: "ADMIN",
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

  describe("Teacher Assignment Validation", () => {
    beforeEach(() => {
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
    });

    it("should return 400 if teacher has no assigned school", async () => {
      mockPrismaUserFindUnique.mockResolvedValue({
        assignedSchool: null,
      } as any);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Teacher has no assigned school");
    });

    it("should return 400 if teacher record not found", async () => {
      mockPrismaUserFindUnique.mockResolvedValue(null);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Teacher has no assigned school");
    });
  });

  describe("Successful Requests", () => {
    beforeEach(() => {
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

      mockPrismaUserFindUnique.mockResolvedValue({
        assignedSchool: "School of Computer Science & Engineering",
      } as any);
    });

    it("should return empty array when no students selected teacher's school", async () => {
      mockPrismaUserFindMany.mockResolvedValue([
        {
          id: "student1",
          name: "John Doe",
          email: "john@test.com",
          selectedSchools: [
            {
              schoolName: "School of Business",
              programName: "BBA",
            },
          ],
          status: "APPROVED",
        },
      ] as any);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.students).toEqual([]);
      expect(data.assignedSchool).toBe("School of Computer Science & Engineering");
    });

    it("should return students who selected teacher's school with correct program", async () => {
      mockPrismaUserFindMany.mockResolvedValue([
        {
          id: "student1",
          name: "John Doe",
          email: "john@test.com",
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
          status: "APPROVED",
        },
        {
          id: "student2",
          name: "Jane Smith",
          email: "jane@test.com",
          selectedSchools: [
            {
              schoolName: "School of Computer Science & Engineering",
              programName: "M.Tech CSE",
            },
          ],
          status: "PENDING",
        },
        {
          id: "student3",
          name: "Bob Johnson",
          email: "bob@test.com",
          selectedSchools: [
            {
              schoolName: "School of Law",
              programName: "BA LLB",
            },
          ],
          status: "APPROVED",
        },
      ] as any);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.students).toHaveLength(2);
      expect(data.students[0]).toEqual({
        id: "student1",
        name: "John Doe",
        email: "john@test.com",
        programForSchool: "B.Tech CSE",
        status: "APPROVED",
      });
      expect(data.students[1]).toEqual({
        id: "student2",
        name: "Jane Smith",
        email: "jane@test.com",
        programForSchool: "M.Tech CSE",
        status: "PENDING",
      });
      expect(data.assignedSchool).toBe("School of Computer Science & Engineering");
    });

    it("should extract only the program for teacher's school from each student", async () => {
      mockPrismaUserFindMany.mockResolvedValue([
        {
          id: "student1",
          name: "John Doe",
          email: "john@test.com",
          selectedSchools: [
            {
              schoolName: "School of Business",
              programName: "BBA",
            },
            {
              schoolName: "School of Computer Science & Engineering",
              programName: "B.Tech CSE",
            },
            {
              schoolName: "School of Law",
              programName: "BA LLB",
            },
          ],
          status: "APPROVED",
        },
      ] as any);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.students).toHaveLength(1);
      expect(data.students[0].programForSchool).toBe("B.Tech CSE");
      // Should not include other programs
      expect(data.students[0]).not.toHaveProperty("selectedSchools");
    });

    it("should handle students with null selectedSchools", async () => {
      mockPrismaUserFindMany.mockResolvedValue([
        {
          id: "student1",
          name: "John Doe",
          email: "john@test.com",
          selectedSchools: null,
          status: "APPROVED",
        },
      ] as any);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.students).toEqual([]);
    });

    it("should handle students with empty selectedSchools array", async () => {
      mockPrismaUserFindMany.mockResolvedValue([
        {
          id: "student1",
          name: "John Doe",
          email: "john@test.com",
          selectedSchools: [],
          status: "APPROVED",
        },
      ] as any);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.students).toEqual([]);
    });

    it("should include students with all statuses (PENDING, APPROVED, REJECTED)", async () => {
      mockPrismaUserFindMany.mockResolvedValue([
        {
          id: "student1",
          name: "Pending Student",
          email: "pending@test.com",
          selectedSchools: [
            {
              schoolName: "School of Computer Science & Engineering",
              programName: "B.Tech CSE",
            },
          ],
          status: "PENDING",
        },
        {
          id: "student2",
          name: "Approved Student",
          email: "approved@test.com",
          selectedSchools: [
            {
              schoolName: "School of Computer Science & Engineering",
              programName: "M.Tech CSE",
            },
          ],
          status: "APPROVED",
        },
        {
          id: "student3",
          name: "Rejected Student",
          email: "rejected@test.com",
          selectedSchools: [
            {
              schoolName: "School of Computer Science & Engineering",
              programName: "PhD CSE",
            },
          ],
          status: "REJECTED",
        },
      ] as any);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.students).toHaveLength(3);
      expect(data.students.map((s: any) => s.status)).toEqual([
        "PENDING",
        "APPROVED",
        "REJECTED",
      ]);
    });

    it("should query teacher's assignedSchool using session user id", async () => {
      mockPrismaUserFindMany.mockResolvedValue([]);

      await GET(mockRequest);

      expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
        where: {
          id: "teacher123",
        },
        select: {
          assignedSchool: true,
        },
      });
    });

    it("should query all students with role STUDENT", async () => {
      mockPrismaUserFindMany.mockResolvedValue([]);

      await GET(mockRequest);

      expect(mockPrismaUserFindMany).toHaveBeenCalledWith({
        where: {
          role: "STUDENT",
        },
        select: {
          id: true,
          name: true,
          email: true,
          selectedSchools: true,
          status: true,
        },
      });
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
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

      mockPrismaUserFindUnique.mockResolvedValue({
        assignedSchool: "School of Computer Science & Engineering",
      } as any);
    });

    it("should return 500 on database error", async () => {
      mockPrismaUserFindMany.mockRejectedValue(
        new Error("Database connection failed")
      );

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
        "Teacher students list error:",
        dbError
      );

      consoleErrorSpy.mockRestore();
    });

    it("should return 500 if teacher lookup fails", async () => {
      mockPrismaUserFindUnique.mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("Internal server error");
    });
  });
});
