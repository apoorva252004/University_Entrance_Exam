import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/student/exam/[examId] - Get exam details with questions for student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const session = await auth();
    const { examId } = await params;

    if (!session?.user || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get exam with questions
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            questionText: true,
            questionType: true,
            options: true,
            marks: true,
            order: true,
            // Don't send correctAnswer to student
          },
        },
        program: true,
        school: true,
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // Check if exam is available (ONGOING status)
    if (exam.status !== 'ONGOING') {
      return NextResponse.json(
        { error: 'Exam is not available for attempt' },
        { status: 400 }
      );
    }

    // Check if exam is for online mode
    if (exam.mode !== 'ONLINE') {
      return NextResponse.json(
        { error: 'This is an offline exam' },
        { status: 400 }
      );
    }

    // Verify student is enrolled in this program
    const student = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { selectedSchools: true },
    });

    if (!student?.selectedSchools) {
      return NextResponse.json({ error: 'Not enrolled in any program' }, { status: 403 });
    }

    const selectedSchools = JSON.parse(student.selectedSchools);
    const isEnrolled = selectedSchools.some(
      (s: any) => s.programName === exam.program.name
    );

    if (!isEnrolled) {
      return NextResponse.json(
        { error: 'You are not enrolled in this program' },
        { status: 403 }
      );
    }

    // Parse options field for each question
    const processedExam = {
      ...exam,
      questions: exam.questions.map(question => ({
        ...question,
        options: question.options ? 
          (typeof question.options === 'string' ? 
            JSON.parse(question.options) : 
            question.options
          ) : [],
      })),
    };

    return NextResponse.json({ exam: processedExam });
  } catch (error) {
    console.error('Error fetching exam:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exam' },
      { status: 500 }
    );
  }
}
