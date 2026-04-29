const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAdmin() {
  // Update admin to set isFirstLogin to false
  const admin = await prisma.user.update({
    where: { email: 'admin@rvu.edu.in' },
    data: { isFirstLogin: false }
  });
  
  console.log('Admin updated:', {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    username: admin.username,
    isFirstLogin: admin.isFirstLogin
  });
  
  // Also update all teachers to set isFirstLogin to false
  const teachers = await prisma.user.updateMany({
    where: { role: 'TEACHER' },
    data: { isFirstLogin: false }
  });
  
  console.log(`Updated ${teachers.count} teachers to set isFirstLogin = false`);
  
  await prisma.$disconnect();
}

fixAdmin();
