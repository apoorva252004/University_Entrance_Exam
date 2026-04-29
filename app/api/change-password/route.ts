import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { isValidPassword } from '@/lib/utils/password';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has isFirstLogin = TRUE
    if (!session.user.isFirstLogin) {
      return NextResponse.json(
        { success: false, message: 'Password change not required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { newPassword, confirmPassword } = body;

    // Validate passwords are provided
    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Both password fields are required' },
        { status: 400 }
      );
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!isValidPassword(newPassword)) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and set isFirstLogin to FALSE
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        isFirstLogin: false
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
