import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Teacher Students List API Route
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 *
 * Handles GET requests to fetch students who selected the teacher's assigned school
 */

interface SelectedSchool {
  schoolName: string;
  programName: string;
}

interface TeacherStudent {
  id: string;
  name: string;
  email: string;
  programForSchool: string;
  status: string;
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

    // Verify requester is teacher (Requirement 4.2)
    if (session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Forbidden - Teacher access required" },
        { status: 403 }
      );
    }

    // Get teacher's assignedSchool from user record (Requirement 4.1)
    const teacher = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        assignedSchool: true,
      },
    });

    if (!teacher || !teacher.assignedSchool) {
      return NextResponse.json(
        { error: "Teacher has no assigned school" },
        { status: 400 }
      );
    }

    const assignedSchool = teacher.assignedSchool;

    // Query all students (we'll filter in application code since MongoDB JSON queries are complex)
    const allStudents = await prisma.user.findMany({
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

    // Filter students who selected the teacher's school and extract the program (Requirements 4.3, 4.4)
    const students: TeacherStudent[] = allStudents
      .map((student) => {
        let selectedSchools: SelectedSchool[] = [];
        
        if (student.selectedSchools) {
          try {
            selectedSchools = typeof student.selectedSchools === 'string' 
              ? JSON.parse(student.selectedSchools) 
              : student.selectedSchools;
          } catch (e) {
            console.error('Error parsing selectedSchools:', e);
            selectedSchools = [];
          }
        }
        
        // Find the school entry that matches teacher's assigned school
        const schoolEntry = selectedSchools.find(
          (school) => school.schoolName === assignedSchool
        );

        // If student selected this school, include them in results
        if (schoolEntry) {
          return {
            id: student.id,
            name: student.name,
            email: student.email,
            programForSchool: schoolEntry.programName,
            status: student.status,
          };
        }

        return null;
      })
      .filter((student): student is TeacherStudent => student !== null);

    // Return filtered student list with assignedSchool (Requirement 4.5)
    return NextResponse.json(
      {
        students,
        assignedSchool,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Log error for debugging
    console.error("Teacher students list error:", error);

    // Return generic error response
    return NextResponse.json(
      {
        error: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}
