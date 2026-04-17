import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get all exams for teacher's assigned school
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teacher = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { assignedSchool: true },
    });

    if (!teacher?.assignedSchool) {
      return NextResponse.json({ error: 'No school assigned' }, { status: 400 });
    }

    const school = await prisma.school.findUnique({
      where: { name: teacher.assignedSchool },
      select: { id: true },
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const exams = await prisma.exam.findMany({
      where: {
        schoolId: school.id,
      },
      include: {
        program: true,
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        questions: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        examDate: 'desc',
      },
    });

    return NextResponse.json({ exams, assignedSchool: teacher.assignedSchool });
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exams' },
      { status: 500 }
    );
  }
}

// Create new exam
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, examDate, duration, totalMarks, programId, mode, venue, instructions } = body;

    // Validate required fields
    if (!title || !examDate || !duration || !totalMarks || !programId || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const teacher = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { assignedSchool: true },
    });

    if (!teacher?.assignedSchool) {
      return NextResponse.json({ error: 'No school assigned' }, { status: 400 });
    }

    const school = await prisma.school.findUnique({
      where: { name: teacher.assignedSchool },
      select: { id: true },
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Verify program belongs to school
    const program = await prisma.program.findUnique({
      where: { id: programId },
      select: { schoolId: true },
    });

    if (!program || program.schoolId !== school.id) {
      return NextResponse.json(
        { error: 'Invalid program for this school' },
        { status: 400 }
      );
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        examDate: new Date(examDate),
        duration: parseInt(duration),
        totalMarks: parseInt(totalMarks),
        schoolId: school.id,
        programId,
        createdById: session.user.id,
        mode,
        venue,
        instructions,
      },
      include: {
        program: true,
      },
    });

    return NextResponse.json({ exam }, { status: 201 });
  } catch (error) {
    console.error('Error creating exam:', error);
    return NextResponse.json(
      { error: 'Failed to create exam' },
      { status: 500 }
    );
  }
}
