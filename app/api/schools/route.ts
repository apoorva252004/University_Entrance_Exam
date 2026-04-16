import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Schools API Route
 * Requirements: 7.1, 7.2, 7.3, 7.4
 *
 * Handles GET requests to fetch all schools and their programs for the student registration form
 * This endpoint does not require authentication (public access)
 */

interface ProgramResponse {
  id: string;
  name: string;
  schoolId: string;
}

interface SchoolResponse {
  id: string;
  name: string;
  programs: ProgramResponse[];
}

export async function GET(request: NextRequest) {
  try {
    // Query all schools with their programs (Requirements 7.1, 7.2)
    const schools = await prisma.school.findMany({
      include: {
        programs: {
          select: {
            id: true,
            name: true,
            schoolId: true,
          },
          orderBy: {
            name: "asc", // Alphabetical order for better UX
          },
        },
      },
      orderBy: {
        name: "asc", // Alphabetical order for better UX
      },
    });

    // Transform response to match expected format (Requirements 7.3, 7.4)
    const schoolsResponse: SchoolResponse[] = schools.map((school) => ({
      id: school.id,
      name: school.name,
      programs: school.programs.map((program) => ({
        id: program.id,
        name: program.name,
        schoolId: program.schoolId,
      })),
    }));

    return NextResponse.json(
      { schools: schoolsResponse },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Log error for debugging
    console.error("Schools API error:", error);

    // Return generic error response
    return NextResponse.json(
      {
        error: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}
