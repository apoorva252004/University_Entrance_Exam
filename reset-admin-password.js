const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function resetAdminPassword() {
  const newPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const admin = await prisma.user.update({
    where: { email: 'admin@rvu.edu.in' },
    data: { 
      password: hashedPassword,
      isFirstLogin: false
    }
  });
  
  console.log('Admin password reset successfully!');
  console.log('Username:', admin.username);
  console.log('Password:', newPassword);
  
  // Verify the password works
  const verify = await bcrypt.compare(newPassword, admin.password);
  console.log('Password verification:', verify ? '✓ SUCCESS' : '✗ FAILED');
  
  await prisma.$disconnect();
}

resetAdminPassword();
