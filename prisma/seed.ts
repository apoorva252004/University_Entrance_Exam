import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Define schools and their programs
  const schoolsData = [
    {
      name: 'School of Computer Science & Engineering',
      programs: ['B.Tech CSE', 'M.Tech CSE', 'PhD CSE'],
    },
    {
      name: 'School of Electronics & Communication',
      programs: ['B.Tech ECE', 'M.Tech ECE'],
    },
    {
      name: 'School of Business',
      programs: ['BBA', 'MBA'],
    },
    {
      name: 'School of Architecture',
      programs: ['B.Arch', 'M.Arch'],
    },
    {
      name: 'School of Liberal Arts',
      programs: ['BA English', 'BA Psychology', 'MA English'],
    },
    {
      name: 'School of Law',
      programs: ['BA LLB', 'BBA LLB', 'LLM'],
    },
    {
      name: 'School of Design',
      programs: ['B.Des', 'M.Des'],
    },
    {
      name: 'School of Sciences',
      programs: ['B.Sc Physics', 'B.Sc Chemistry', 'M.Sc Physics'],
    },
    {
      name: 'School of Civil Engineering',
      programs: ['B.Tech Civil', 'M.Tech Civil'],
    },
  ];

  // Create schools and programs
  console.log('Creating schools and programs...');
  for (const schoolData of schoolsData) {
    const school = await prisma.school.create({
      data: {
        name: schoolData.name,
        programs: {
          create: schoolData.programs.map((programName) => ({
            name: programName,
          })),
        },
      },
      include: {
        programs: true,
      },
    });
    console.log(`Created school: ${school.name} with ${school.programs.length} programs`);
  }

  // Create admin user
  console.log('Creating admin user...');
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@rvu.edu.in',
      password: hashedAdminPassword,
      phone: '9876543210',
      role: 'ADMIN',
      status: 'APPROVED',
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // Create 2 teachers per school (18 total)
  console.log('Creating teachers...');
  const schools = await prisma.school.findMany();
  let teacherCount = 0;

  for (const school of schools) {
    for (let i = 1; i <= 2; i++) {
      teacherCount++;
      const hashedTeacherPassword = await bcrypt.hash('teacher123', 10);
      const teacher = await prisma.user.create({
        data: {
          name: `Teacher ${teacherCount}`,
          email: `teacher${teacherCount}@rvu.edu.in`,
          password: hashedTeacherPassword,
          phone: `98765432${String(teacherCount).padStart(2, '0')}`,
          role: 'TEACHER',
          status: 'APPROVED',
          assignedSchool: school.name,
        },
      });
      console.log(`Created teacher: ${teacher.email} assigned to ${school.name}`);
    }
  }

  console.log('Database seed completed successfully!');
  console.log(`Total: ${schools.length} schools, ${teacherCount} teachers, 1 admin`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
