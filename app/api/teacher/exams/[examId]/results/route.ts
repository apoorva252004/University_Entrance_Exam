import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/teacher/exams/[examId]/results - Get exam results with student attempts
export async function GET(
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
        attempts: {
          include: {
            student: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            submittedAt: 'desc',
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

    // Calculate statistics
    const scores = exam.attempts
      .filter(a => a.score !== null)
      .map(a => a.score as number);

    const stats = {
      totalAttempts: exam.attempts.length,
      averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
    };

    return NextResponse.json({
      exam: {
        title: exam.title,
        totalMarks: exam.totalMarks,
        duration: exam.duration,
        mode: exam.mode,
        status: exam.status,
      },
      attempts: exam.attempts,
      stats,
    });
  } catch (error) {
    console.error('Error fetching exam results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exam results' },
      { status: 500 }
    );
  }
}
