import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/student/exam/[examId]/submit - Submit exam answers
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const session = await auth();
    const { examId } = await params;

    if (!session?.user || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { answers } = body; // answers is Record<questionId, answerText>

    // Get exam with questions
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: true,
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    if (exam.status !== 'ONGOING') {
      return NextResponse.json(
        { error: 'Exam is not available' },
        { status: 400 }
      );
    }

    // Check if student already attempted this exam
    const existingAttempt = await prisma.examAttempt.findUnique({
      where: {
        examId_studentId: {
          examId,
          studentId: session.user.id,
        },
      },
    });

    if (existingAttempt) {
      return NextResponse.json(
        { error: 'You have already attempted this exam' },
        { status: 400 }
      );
    }

    // Calculate score for auto-gradable questions (MCQ and TRUE_FALSE)
    let totalScore = 0;
    const answerRecords = [];

    for (const question of exam.questions) {
      const studentAnswer = answers[question.id] || '';
      let isCorrect = null;
      let marksAwarded = 0;

      if (question.questionType === 'MCQ' || question.questionType === 'TRUE_FALSE') {
        isCorrect = studentAnswer.trim() === question.correctAnswer?.trim();
        marksAwarded = isCorrect ? question.marks : 0;
        totalScore += marksAwarded;
      }

      answerRecords.push({
        questionId: question.id,
        answerText: studentAnswer,
        isCorrect,
        marksAwarded: question.questionType === 'MCQ' || question.questionType === 'TRUE_FALSE' ? marksAwarded : null,
      });
    }

    // Create exam attempt with answers
    const attempt = await prisma.examAttempt.create({
      data: {
        examId,
        studentId: session.user.id,
        submittedAt: new Date(),
        score: totalScore,
        totalMarks: exam.totalMarks,
        answers: {
          create: answerRecords,
        },
      },
      include: {
        answers: true,
      },
    });

    return NextResponse.json({
      message: 'Exam submitted successfully',
      attemptId: attempt.id,
      score: totalScore,
      totalMarks: exam.totalMarks,
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    return NextResponse.json(
      { error: 'Failed to submit exam' },
      { status: 500 }
    );
  }
}
