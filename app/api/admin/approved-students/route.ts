import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        status: 'APPROVED',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        selectedSchools: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse selectedSchools JSON for each student
    const studentsWithParsedSchools = students.map((student) => ({
      ...student,
      selectedSchools: student.selectedSchools
        ? JSON.parse(student.selectedSchools)
        : [],
    }));

    return NextResponse.json({ students: studentsWithParsedSchools });
  } catch (error) {
    console.error('Error fetching approved students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approved students' },
      { status: 500 }
    );
  }
}
