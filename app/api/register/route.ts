import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { generateUsername } from "@/lib/utils/username";
import { generateSecurePassword } from "@/lib/utils/password";
import { isValidEmail, isValidPhone } from "@/lib/utils/validation";
import { logAuditEvent } from "@/lib/utils/audit-log";

/**
 * Student Registration API Route
 * Auto-generates username and password for new students
 *
 * Handles POST requests for student registration with school selection
 */

interface RegisterRequestBody {
  name: string;
  email: string;
  phone: string;
  selectedSchools: {
    schoolId: string;
    programIds: string[];
  }[];
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: RegisterRequestBody = await request.json();
    const { name, email, phone, selectedSchools = [] } = body;

    // Validation errors array
    const errors: string[] = [];

    // Validate all inputs
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      errors.push("Name is required");
    }

    if (!isValidEmail(email)) {
      errors.push("Invalid email format");
    }

    // Phone is optional, only validate if provided
    if (phone && phone.trim().length > 0 && !isValidPhone(phone)) {
      errors.push("Invalid phone number format (must be 10 digits)");
    }

    if (!selectedSchools || selectedSchools.length === 0) {
      errors.push("Select at least one school and one program");
    }

    // Return validation errors if any
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, errors },
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
          message: "Email already registered. Please login or use a different email.",
        },
        { status: 409 }
      );
    }

    // Generate unique username (firstname + 3-digit number)
    let username: string;
    try {
      username = await generateUsername(name.trim());
    } catch (error) {
      console.error("Username generation error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Unable to generate unique username. Please try again.",
        },
        { status: 500 }
      );
    }

    // Generate secure password (8-10 characters)
    const plainPassword = generateSecurePassword();

    // Hash the generated password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Transform selectedSchools to JSON format for storage
    // Convert from { schoolId, programIds[] } to [{ schoolName, programName }]
    const selectedSchoolsArray: { schoolName: string; programName: string }[] = [];
    
    for (const selection of selectedSchools) {
      const school = await prisma.school.findUnique({
        where: { id: selection.schoolId },
        include: { programs: true },
      });

      if (!school) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid school selected",
          },
          { status: 400 }
        );
      }

      for (const programId of selection.programIds) {
        const program = school.programs.find((p) => p.id === programId);
        if (!program) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid program selected",
            },
            { status: 400 }
          );
        }
        selectedSchoolsArray.push({
          schoolName: school.name,
          programName: program.name,
        });
      }
    }

    // Create user with role STUDENT, status APPROVED, isFirstLogin TRUE
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        username: username,
        password: hashedPassword,
        phone: phone && phone.trim().length > 0 ? phone.trim() : null,
        role: "STUDENT",
        status: "APPROVED",
        isFirstLogin: true,
        selectedSchools: JSON.stringify(selectedSchoolsArray),
      },
    });

    // Log account creation
    logAuditEvent({
      eventType: 'ACCOUNT_CREATED',
      userId: user.id,
      username: username,
      success: true,
      details: { role: 'STUDENT', email: user.email },
    });

    // Return success response with userId, username, and plain-text password
    // Password is only returned once - user must save it
    return NextResponse.json(
      {
        success: true,
        message: "Registration successful! Please save your credentials.",
        userId: user.id,
        username: username,
        password: plainPassword, // Plain text password (only returned once)
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
            message: "Email or username already registered. Please try again.",
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
        message: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}

