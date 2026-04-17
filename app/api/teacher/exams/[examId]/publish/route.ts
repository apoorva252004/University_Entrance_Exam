import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/teacher/exams/[examId]/publish - Publish an exam (change status to ONGOING)
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
      include: {
        questions: true,
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    if (exam.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if exam has questions
    if (exam.questions.length === 0) {
      return NextResponse.json(
        { error: 'Cannot publish exam without questions' },
        { status: 400 }
      );
    }

    // Check if exam is already published or completed
    if (exam.status === 'ONGOING') {
      return NextResponse.json(
        { error: 'Exam is already published' },
        { status: 400 }
      );
    }

    if (exam.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot publish a completed exam' },
        { status: 400 }
      );
    }

    // Update exam status to ONGOING
    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: {
        status: 'ONGOING',
      },
    });

    return NextResponse.json({ 
      message: 'Exam published successfully',
      exam: updatedExam 
    });
  } catch (error) {
    console.error('Error publishing exam:', error);
    return NextResponse.json(
      { error: 'Failed to publish exam' },
      { status: 500 }
    );
  }
}
