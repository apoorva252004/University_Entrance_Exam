import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

/**
 * Admin Assign Credentials API Route
 * 
 * Allows admin to assign username and password to pending users
 */

interface AssignCredentialsRequest {
  userId: string;
  username: string;
  password: string;
  role?: string; // Optional: can change role (STUDENT, TEACHER)
}

export async function POST(request: NextRequest) {
  try {
    // Verify requester is admin
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Parse request body
    const body: AssignCredentialsRequest = await request.json();
    const { userId, username, password, role } = body;

    // Validation
    const errors: string[] = [];

    if (!userId) {
      errors.push("User ID is required");
    }

    if (!username || username.trim().length < 3) {
      errors.push("Username must be at least 3 characters");
    }

    if (!password || password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (role && !["STUDENT", "TEACHER"].includes(role)) {
      errors.push("Invalid role. Must be STUDENT or TEACHER");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if username is already taken
    const existingUsername = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    if (existingUsername && existingUsername.id !== userId) {
      return NextResponse.json(
        { success: false, error: "Username already taken" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user with credentials and activate
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: username.trim(),
        password: hashedPassword,
        status: "APPROVED",
        role: role || user.role, // Update role if provided
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Credentials assigned and account activated successfully",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          username: updatedUser.username,
          role: updatedUser.role,
          status: updatedUser.status,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Assign credentials error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}
