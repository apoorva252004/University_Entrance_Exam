import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get student's selected schools
    const student = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { selectedSchools: true },
    });

    if (!student?.selectedSchools) {
      return NextResponse.json({ exams: [] });
    }

    // Parse selected schools
    const selectedSchools = JSON.parse(student.selectedSchools);
    
    // Get program IDs for selected schools/programs
    const programNames = selectedSchools.map((s: any) => s.programName);
    
    const programs = await prisma.program.findMany({
      where: {
        name: {
          in: programNames,
        },
      },
      select: {
        id: true,
      },
    });

    const programIds = programs.map(p => p.id);

    // Get exams for these programs
    const exams = await prisma.exam.findMany({
      where: {
        programId: {
          in: programIds,
        },
        status: {
          in: ['SCHEDULED', 'ONGOING', 'COMPLETED'],
        },
      },
      include: {
        program: true,
        school: true,
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
        attempts: {
          where: {
            studentId: session.user.id,
          },
          select: {
            id: true,
            submittedAt: true,
          },
        },
      },
      orderBy: {
        examDate: 'asc',
      },
    });

    return NextResponse.json({ exams });
  } catch (error) {
    console.error('Error fetching student exams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exams' },
      { status: 500 }
    );
  }
}
