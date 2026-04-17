import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
      include: {
        programs: true,
      },
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    return NextResponse.json({ programs: school.programs });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}
