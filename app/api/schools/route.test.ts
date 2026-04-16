import { GET } from "./route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    school: {
      findMany: jest.fn(),
    },
  },
}));

const mockPrismaSchoolFindMany = prisma.school.findMany as jest.MockedFunction<
  typeof prisma.school.findMany
>;

describe("GET /api/schools", () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = new NextRequest("http://localhost:3000/api/schools");
  });

  describe("Successful Requests", () => {
    it("should return empty array when no schools exist", async () => {
      mockPrismaSchoolFindMany.mockResolvedValue([]);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.schools).toEqual([]);
      expect(mockPrismaSchoolFindMany).toHaveBeenCalledWith({
        include: {
          programs: {
            select: {
              id: true,
              name: true,
              schoolId: true,
            },
            orderBy: {
              name: "asc",
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });
    });

    it("should return all schools with their programs", async () => {
      const mockSchools = [
        {
          id: "school1",
          name: "School of Computer Science & Engineering",
          programs: [
            {
              id: "prog1",
              name: "B.Tech CSE",
              schoolId: "school1",
              createdAt: new Date(),
            },
            {
              id: "prog2",
              name: "M.Tech CSE",
              schoolId: "school1",
              createdAt: new Date(),
            },
          ],
          createdAt: new Date(),
        },
        {
          id: "school2",
          name: "School of Business",
          programs: [
            {
              id: "prog3",
              name: "BBA",
              schoolId: "school2",
              createdAt: new Date(),
            },
            {
              id: "prog4",
              name: "MBA",
              schoolId: "school2",
              createdAt: new Date(),
            },
          ],
          createdAt: new Date(),
        },
      ];

      mockPrismaSchoolFindMany.mockResolvedValue(mockSchools as any);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.schools).toHaveLength(2);
      
      // Verify first school structure
      expect(data.schools[0]).toEqual({
        id: "school1",
        name: "School of Computer Science & Engineering",
        programs: [
          {
            id: "prog1",
            name: "B.Tech CSE",
            schoolId: "school1",
          },
          {
            id: "prog2",
            name: "M.Tech CSE",
            schoolId: "school1",
          },
        ],
      });

      // Verify second school structure
      expect(data.schools[1]).toEqual({
        id: "school2",
        name: "School of Business",
        programs: [
          {
            id: "prog3",
            name: "BBA",
            schoolId: "school2",
          },
          {
            id: "prog4",
            name: "MBA",
            schoolId: "school2",
          },
        ],
      });
    });

    it("should return school with empty programs array if no programs exist", async () => {
      const mockSchools = [
        {
          id: "school1",
          name: "School of Computer Science & Engineering",
          programs: [],
          createdAt: new Date(),
        },
      ];

      mockPrismaSchoolFindMany.mockResolvedValue(mockSchools as any);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.schools).toHaveLength(1);
      expect(data.schools[0].programs).toEqual([]);
    });

    it("should include all required fields in response", async () => {
      const mockSchools = [
        {
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
        },
      ];

      mockPrismaSchoolFindMany.mockResolvedValue(mockSchools as any);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      
      // Verify school has required fields
      expect(data.schools[0]).toHaveProperty("id");
      expect(data.schools[0]).toHaveProperty("name");
      expect(data.schools[0]).toHaveProperty("programs");
      
      // Verify program has required fields
      expect(data.schools[0].programs[0]).toHaveProperty("id");
      expect(data.schools[0].programs[0]).toHaveProperty("name");
      expect(data.schools[0].programs[0]).toHaveProperty("schoolId");
    });

    it("should order schools alphabetically by name", async () => {
      mockPrismaSchoolFindMany.mockResolvedValue([]);

      await GET(mockRequest);

      expect(mockPrismaSchoolFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            name: "asc",
          },
        })
      );
    });

    it("should order programs alphabetically by name within each school", async () => {
      mockPrismaSchoolFindMany.mockResolvedValue([]);

      await GET(mockRequest);

      expect(mockPrismaSchoolFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            programs: expect.objectContaining({
              orderBy: {
                name: "asc",
              },
            }),
          }),
        })
      );
    });

    it("should not require authentication (public endpoint)", async () => {
      // This test verifies that the endpoint doesn't check for authentication
      mockPrismaSchoolFindMany.mockResolvedValue([]);

      const response = await GET(mockRequest);

      expect(response.status).toBe(200);
      // If authentication was required, we would expect 401 here
    });
  });

  describe("Error Handling", () => {
    it("should return 500 on database error", async () => {
      mockPrismaSchoolFindMany.mockRejectedValue(
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
      mockPrismaSchoolFindMany.mockRejectedValue(dbError);

      await GET(mockRequest);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Schools API error:", dbError);

      consoleErrorSpy.mockRestore();
    });

    it("should handle unexpected errors gracefully", async () => {
      mockPrismaSchoolFindMany.mockRejectedValue("Unexpected error");

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error. Please try again later.");
    });
  });
});
