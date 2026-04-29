const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixStudentStatus() {
  // Update all students with ACTIVE status to APPROVED
  const result = await prisma.user.updateMany({
    where: { 
      role: 'STUDENT',
      status: 'ACTIVE'
    },
    data: {
      status: 'APPROVED'
    }
  });
  
  console.log(`Updated ${result.count} student(s) from ACTIVE to APPROVED`);
  
  // Verify the change
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: {
      name: true,
      email: true,
      username: true,
      status: true
    }
  });
  
  console.log('\nAll students:');
  students.forEach(student => {
    console.log(`- ${student.name} (${student.username}): ${student.status}`);
  });
  
  await prisma.$disconnect();
}

fixStudentStatus();
