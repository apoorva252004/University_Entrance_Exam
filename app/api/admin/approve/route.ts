import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Admin Approval API Route
 * Requirements: 3.4, 3.5, 3.6
 *
 * Handles PATCH requests to approve or reject student applications
 */

interface ApproveRequest {
  studentId: string;
  action: "approve" | "reject";
}

export async function PATCH(request: NextRequest) {
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

    // Verify requester is admin (Requirement 3.4)
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    let body: ApproveRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { studentId, action } = body;

    // Validate request body
    if (!studentId || typeof studentId !== "string") {
      return NextResponse.json(
        { error: "studentId is required and must be a string" },
        { status: 400 }
      );
    }

    if (!action || (action !== "approve" && action !== "reject")) {
      return NextResponse.json(
        { error: 'action is required and must be either "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Validate studentId exists and user is a student (Requirement 3.5)
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        role: true,
        status: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    if (student.role !== "STUDENT") {
      return NextResponse.json(
        { error: "User is not a student" },
        { status: 400 }
      );
    }

    // Update user status based on action (Requirement 3.6)
    const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

    await prisma.user.update({
      where: { id: studentId },
      data: {
        status: newStatus,
      },
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Student ${action === "approve" ? "approved" : "rejected"} successfully`,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Log error for debugging
    console.error("Admin approval error:", error);

    // Return generic error response
    return NextResponse.json(
      {
        error: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}
