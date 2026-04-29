const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });
  
  console.log('Admin user:', {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    username: admin.username,
    isFirstLogin: admin.isFirstLogin
  });
  
  await prisma.$disconnect();
}

checkAdmin();
