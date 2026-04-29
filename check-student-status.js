const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStudent() {
  const student = await prisma.user.findFirst({
    where: { 
      role: 'STUDENT',
      email: 'piyush@gmail.com'
    }
  });
  
  if (student) {
    console.log('Student found:', {
      id: student.id,
      name: student.name,
      email: student.email,
      username: student.username,
      status: student.status,
      isFirstLogin: student.isFirstLogin
    });
  } else {
    console.log('Student not found');
  }
  
  await prisma.$disconnect();
}

checkStudent();
