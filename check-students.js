const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStudents() {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { 
        id: true,
        email: true, 
        name: true, 
        role: true, 
        status: true,
        selectedSchools: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`\nTotal students: ${students.length}\n`);
    
    students.forEach((student, index) => {
      console.log(`Student ${index + 1}:`);
      console.log(`  Name: ${student.name}`);
      console.log(`  Email: ${student.email}`);
      console.log(`  Status: ${student.status}`);
      console.log(`  Selected Schools: ${student.selectedSchools || 'None'}`);
      console.log(`  Created: ${student.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudents();
