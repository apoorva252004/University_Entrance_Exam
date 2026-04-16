import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Admin Students List API Route
 * Requirements: 3.1, 3.2, 3.3
 *
 * Handles GET requests to fetch all pending student registrations for admin approval
 */

interface SelectedSchool {
  schoolName: string;
  programName: string;
}

interface StudentResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  selectedSchools: SelectedSchool[];
  createdAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    // Get session to verify authentication and role
    const session = await auth();

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    // Verify requester is admin (Requirement 3.1)
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Query users with role STUDENT and status PENDING (Requirement 3.2)
    const pendingStudents = await prisma.user.findMany({
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
        createdAt: "desc", // Most recent first
      },
    });

    // Transform response to match expected format (Requirement 3.3)
    const students: StudentResponse[] = pendingStudents.map((student) => ({
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      selectedSchools: (student.selectedSchools as SelectedSchool[]) || [],
      createdAt: student.createdAt,
    }));

    return NextResponse.json(
      { students },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Log error for debugging
    console.error("Admin students list error:", error);

    // Return generic error response
    return NextResponse.json(
      {
        error: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}
