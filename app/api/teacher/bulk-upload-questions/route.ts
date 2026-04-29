import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Bulk Question Upload API Route
 * 
 * Allows teachers to upload multiple questions via CSV/Excel format
 */

interface QuestionRow {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  marks?: number;
}

interface ValidationError {
  row: number;
  errors: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Verify requester is teacher
    const session = await auth();

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Teacher access required." },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { examId, questions } = body as { examId: string; questions: QuestionRow[] };

    // Validation
    if (!examId) {
      return NextResponse.json(
        { success: false, error: "Exam ID is required" },
        { status: 400 }
      );
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: "Questions array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Verify exam exists and belongs to teacher
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 }
      );
    }

    if (exam.createdById !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You can only add questions to your own exams" },
        { status: 403 }
      );
    }

    // Validate all questions
    const validationErrors: ValidationError[] = [];
    const validQuestions: QuestionRow[] = [];

    questions.forEach((q, index) => {
      const rowNumber = index + 1;
      const errors: string[] = [];

      // Check required fields
      if (!q.question || q.question.trim().length === 0) {
        errors.push("Question text is required");
      }

      if (!q.optionA || q.optionA.trim().length === 0) {
        errors.push("Option A is required");
      }

      if (!q.optionB || q.optionB.trim().length === 0) {
        errors.push("Option B is required");
      }

      if (!q.optionC || q.optionC.trim().length === 0) {
        errors.push("Option C is required");
      }

      if (!q.optionD || q.optionD.trim().length === 0) {
        errors.push("Option D is required");
      }

      if (!q.correctAnswer || q.correctAnswer.trim().length === 0) {
        errors.push("Correct answer is required");
      } else {
        // Validate correct answer matches one of the options (A, B, C, D)
        const normalizedAnswer = q.correctAnswer.trim().toUpperCase();
        if (!['A', 'B', 'C', 'D'].includes(normalizedAnswer)) {
          errors.push("Correct answer must be A, B, C, or D");
        }
      }

      if (errors.length > 0) {
        validationErrors.push({ row: rowNumber, errors });
      } else {
        validQuestions.push(q);
      }
    });

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed for some questions",
          validationErrors,
          validCount: validQuestions.length,
          invalidCount: validationErrors.length,
        },
        { status: 400 }
      );
    }

    // Get current question count for ordering
    const existingQuestions = await prisma.question.findMany({
      where: { examId },
      select: { order: true },
      orderBy: { order: 'desc' },
      take: 1,
    });

    let nextOrder = existingQuestions.length > 0 ? existingQuestions[0].order + 1 : 1;

    // Insert all valid questions in bulk
    const createdQuestions = await prisma.$transaction(
      validQuestions.map((q) => {
        const options = JSON.stringify([
          { label: 'A', text: q.optionA.trim() },
          { label: 'B', text: q.optionB.trim() },
          { label: 'C', text: q.optionC.trim() },
          { label: 'D', text: q.optionD.trim() },
        ]);

        const correctAnswer = q.correctAnswer.trim().toUpperCase();
        const marks = q.marks && q.marks > 0 ? q.marks : 1;

        return prisma.question.create({
          data: {
            examId,
            questionText: q.question.trim(),
            questionType: 'MCQ',
            options,
            correctAnswer,
            marks,
            order: nextOrder++,
          },
        });
      })
    );

    return NextResponse.json(
      {
        success: true,
        message: `Successfully uploaded ${createdQuestions.length} questions`,
        count: createdQuestions.length,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Bulk upload error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}
