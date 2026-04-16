import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

/**
 * Student Registration API Route
 * Simplified version for signup form
 *
 * Handles POST requests for student registration with school selection
 */

interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  selectedSchools?: string[]; // Array of school IDs
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: RegisterRequestBody = await request.json();
    const { name, email, password, selectedSchools = [] } = body;

    // Validation errors array
    const errors: string[] = [];

    // Validate all inputs
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      errors.push("Name is required");
    }

    if (!email || !email.includes("@")) {
      errors.push("Invalid email format");
    }

    if (!password || password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    // Return validation errors if any
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Email already registered. Please login or use a different email.",
        },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Convert selectedSchools array to JSON string for SQLite
    const selectedSchoolsString = selectedSchools.length > 0 
      ? JSON.stringify(selectedSchools) 
      : null;

    // Create user with role STUDENT, status PENDING
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        password: hashedPassword,
        phone: "", // Optional field, can be empty
        role: "STUDENT",
        status: "PENDING",
        selectedSchools: selectedSchoolsString,
      },
    });

    // Return success response with userId
    return NextResponse.json(
      {
        success: true,
        message: "Registration successful. Waiting for admin approval.",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Handle Prisma P2002 error (unique constraint violation)
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            success: false,
            error: "Email already registered. Please login or use a different email.",
          },
          { status: 409 }
        );
      }
    }

    // Log error for debugging
    console.error("Registration error:", error);

    // Return generic error response
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}
