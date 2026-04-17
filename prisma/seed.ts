import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Define schools and their programs (from rvu.edu.in official website)
  const schoolsData = [
    {
      name: 'School of Liberal Arts and Sciences',
      programs: [
        'B.A (Hons) Philosophy',
        'B.A (Hons) Politics and International Relations',
        'B.Sc. (Hons) Psychology',
        'B.Sc. (Hons) Environmental Science',
      ],
    },
    {
      name: 'School of Design and Innovation',
      programs: [
        'B.Des (Hons) User Experience',
        'B.Des (Hons) Interior Environments',
        'B.Des (Hons) Communication and New Media',
        'B.Des (Hons) Product',
        'B.Des (Hons) Transdisciplinary Contexts',
      ],
    },
    {
      name: 'School of Business',
      programs: [
        'B.B.A (Hons) Digital Marketing',
        'B.B.A (Hons) Capital Market',
        'B.B.A (Hons) Business Intelligence and Data Analytics',
        'B.B.A (Hons) Finance',
        'B.B.A (Hons) HR',
        'B.B.A (Hons) Marketing and Analytics',
        'B.Com (Hons) Accounting & Taxation',
        'B.Com (Hons) Finance & Wealth Management',
        'B.Com (Hons) Banking & Insurance',
        'B.Com (Hons) International Accounting (ACCA)',
      ],
    },
    {
      name: 'School of Economics and Public Policy',
      programs: [
        'B.Sc. (Hons) Economics - Data Analytics',
        'B.Sc. (Hons) Economics - Development Studies & Public Policy',
      ],
    },
    {
      name: 'School of Computer Science and Engineering',
      programs: [
        'B.Tech (Hons) CSE - AIML',
        'B.Tech (Hons) CSE - Data Science & Engineering',
        'B.Tech (Hons) CSE - Cloud Computing',
        'B.Tech (Hons) CSE - Cyber Security',
        'B.Sc (Hons) Data Science',
        'B.Sc (Hons) Computer Science',
        'BCA (Hons)',
      ],
    },
    {
      name: 'School of Law',
      programs: [
        'B.B.A LLB (Hons)',
        'B.A. LLB (Hons)',
        'B.Sc. (Hons) Criminology, Cyber Law and Forensic Sciences',
      ],
    },
    {
      name: 'School of Film, Media and Creative Arts',
      programs: [
        'B.A. Acting (Film, TV and OTT)',
        'B.A. (Hons) Media and Journalism',
        'B.Sc. (Hons) Animation, Visual Effects and Gaming',
        'B.Sc. (Hons) Filmmaking',
      ],
    },
    {
      name: 'School for Continuing Education & Professional Studies',
      programs: [
        'Executive Education Programs',
        'Postgraduate Diplomas',
        'Certificate Programmes',
        'Accelerated Masters Programme',
      ],
    },
    {
      name: 'School of Allied and Healthcare Professions',
      programs: [
        'B.Sc. (Hons) Medical Laboratory Technology',
        'B.Sc. (Hons) Anesthesia & Operation Theatre Technology',
        'B.Sc. (Hons) Cardiac Care Technology',
      ],
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
  
  // School abbreviations mapping
  const schoolAbbreviations: Record<string, string> = {
    'School of Liberal Arts and Sciences': 'solas',
    'School of Design and Innovation': 'sdi',
    'School of Business': 'sob',
    'School of Economics and Public Policy': 'soepp',
    'School of Computer Science and Engineering': 'socse',
    'School of Law': 'sol',
    'School of Film, Media and Creative Arts': 'sofmca',
    'School for Continuing Education & Professional Studies': 'sceps',
    'School of Allied and Healthcare Professions': 'soahp',
  };

  for (const school of schools) {
    const abbr = schoolAbbreviations[school.name] || 'teacher';
    
    for (let i = 1; i <= 2; i++) {
      const hashedTeacherPassword = await bcrypt.hash('teacher123', 10);
      const teacherEmail = `${abbr}t${i}@rvu.edu.in`;
      const teacherName = `${abbr.toUpperCase()}T${i}`;
      
      const teacher = await prisma.user.create({
        data: {
          name: teacherName,
          email: teacherEmail,
          password: hashedTeacherPassword,
          phone: `9876543${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
          role: 'TEACHER',
          status: 'APPROVED',
          assignedSchool: school.name,
        },
      });
      console.log(`Created teacher: ${teacher.email} (${teacher.name}) assigned to ${school.name}`);
    }
  }

  console.log('Database seed completed successfully!');
  console.log(`Total: ${schools.length} schools, ${schools.length * 2} teachers, 1 admin`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
