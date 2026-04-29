const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
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
    isFirstLogin: admin.isFirstLogin,
    status: admin.status
  });
  
  // Test password
  const testPasswords = ['admin123', 'Admin123', 'admin', 'password'];
  
  for (const pwd of testPasswords) {
    const match = await bcrypt.compare(pwd, admin.password);
    if (match) {
      console.log(`\n✓ Password is: "${pwd}"`);
      break;
    }
  }
  
  await prisma.$disconnect();
}

checkAdmin();
