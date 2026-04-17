import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/teacher/exams/[examId]/stop - Stop an exam (change status to COMPLETED)
export async function PATCH(
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
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    if (exam.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if exam is ongoing
    if (exam.status !== 'ONGOING') {
      return NextResponse.json(
        { error: 'Only ongoing exams can be stopped' },
        { status: 400 }
      );
    }

    // Update exam status to COMPLETED
    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: {
        status: 'COMPLETED',
      },
    });

    return NextResponse.json({
      message: 'Exam stopped successfully',
      exam: updatedExam,
    });
  } catch (error) {
    console.error('Error stopping exam:', error);
    return NextResponse.json(
      { error: 'Failed to stop exam' },
      { status: 500 }
    );
  }
}
