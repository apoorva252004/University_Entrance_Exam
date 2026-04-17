import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/teacher/exams/[examId]/questions/[questionId] - Update a question
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string; questionId: string }> }
) {
  try {
    const session = await auth();
    const { examId, questionId } = await params;

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

    // Verify question belongs to this exam
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion || existingQuestion.examId !== examId) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const body = await request.json();
    const { questionText, questionType, options, correctAnswer, marks, order } = body;

    // Update question
    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        questionText: questionText || existingQuestion.questionText,
        questionType: questionType || existingQuestion.questionType,
        options: options !== undefined ? options : existingQuestion.options,
        correctAnswer: correctAnswer !== undefined ? correctAnswer : existingQuestion.correctAnswer,
        marks: marks ? parseInt(marks) : existingQuestion.marks,
        order: order !== undefined ? order : existingQuestion.order,
      },
    });

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

// DELETE /api/teacher/exams/[examId]/questions/[questionId] - Delete a question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string; questionId: string }> }
) {
  try {
    const session = await auth();
    const { examId, questionId } = await params;

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

    // Verify question belongs to this exam
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion || existingQuestion.examId !== examId) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Delete question
    await prisma.question.delete({
      where: { id: questionId },
    });

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}
