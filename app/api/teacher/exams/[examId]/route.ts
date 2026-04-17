import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE /api/teacher/exams/[examId] - Delete an exam
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const session = await auth();
    const { examId } = await params;

    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify teacher owns this exam
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    if (exam.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete exam (cascade will delete questions and attempts)
    await prisma.exam.delete({
      where: { id: examId },
    });

    return NextResponse.json({
      message: 'Exam deleted successfully',
      deletedAttempts: exam._count.attempts,
    });
  } catch (error) {
    console.error('Error deleting exam:', error);
    return NextResponse.json(
      { error: 'Failed to delete exam' },
      { status: 500 }
    );
  }
}
