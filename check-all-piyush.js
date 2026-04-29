const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllPiyush() {
  const students = await prisma.user.findMany({
    where: { 
      OR: [
        { name: { contains: 'Piyush' } },
        { email: { contains: 'piyush' } },
        { username: { contains: 'piyush' } }
      ]
    }
  });
  
  console.log(`Found ${students.length} user(s):`);
  students.forEach(student => {
    console.log({
      id: student.id,
      name: student.name,
      email: student.email,
      username: student.username,
      status: student.status,
      isFirstLogin: student.isFirstLogin,
      role: student.role
    });
  });
  
  await prisma.$disconnect();
}

checkAllPiyush();
