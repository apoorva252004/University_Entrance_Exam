import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/change-password
 * Changes user password on first login
 */
export async function POST(request: NextRequest) {
  console.log('[API] ========================================');
  console.log('[API] Change password request received');
  console.log('[API] ========================================');
  
  try {
    // 1. Authenticate user
    const session = await auth();
    
    console.log('[API] Session:', session ? 'EXISTS' : 'NULL');
    console.log('[API] User:', session?.user ? session.user.id : 'NO USER');
    
    if (!session?.user) {
      console.log('[API] Unauthorized - no session');
      return NextResponse.json(
        { success: false, message: 'Not authenticated. Please log in again.' },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    console.log('[API] User authenticated:', session.user.id);

    // 2. Verify first login status
    if (!session.user.isFirstLogin) {
      console.log('[API] User does not require password change');
      return NextResponse.json(
        { success: false, message: 'Password change not required.' },
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const { newPassword, confirmPassword } = body;

    console.log('[API] Request body parsed');

    // 4. Validate input
    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Both password fields are required.' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match.' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // 5. Validate password strength
    const errors: string[] = [];
    
    if (newPassword.length < 8) {
      errors.push('at least 8 characters');
    }
    if (!/[A-Z]/.test(newPassword)) {
      errors.push('one uppercase letter');
    }
    if (!/[a-z]/.test(newPassword)) {
      errors.push('one lowercase letter');
    }
    if (!/[0-9]/.test(newPassword)) {
      errors.push('one number');
    }
    if (!/[@#$%&*!]/.test(newPassword)) {
      errors.push('one special character (@#$%&*!)');
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Password must contain ${errors.join(', ')}.` 
        },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    console.log('[API] Password validation passed');

    // 6. Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('[API] Password hashed');

    // 7. Update database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        isFirstLogin: false,
        updatedAt: new Date()
      }
    });

    console.log('[API] Database updated successfully');

    // 8. Return success
    return NextResponse.json(
      {
        success: true,
        message: 'Password changed successfully!'
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

  } catch (error) {
    console.error('[API] Error changing password:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while changing your password. Please try again.' 
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}
