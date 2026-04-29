const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyStatusConsistency() {
  console.log('=== Status Consistency Verification ===\n');
  
  // Check all users and their statuses
  const users = await prisma.user.findMany({
    select: {
      name: true,
      email: true,
      username: true,
      role: true,
      status: true
    },
    orderBy: [
      { role: 'asc' },
      { name: 'asc' }
    ]
  });
  
  const statusByRole = {
    ADMIN: {},
    TEACHER: {},
    STUDENT: {}
  };
  
  users.forEach(user => {
    if (!statusByRole[user.role][user.status]) {
      statusByRole[user.role][user.status] = 0;
    }
    statusByRole[user.role][user.status]++;
  });
  
  console.log('Status Distribution by Role:');
  console.log('----------------------------');
  
  Object.keys(statusByRole).forEach(role => {
    console.log(`\n${role}:`);
    Object.keys(statusByRole[role]).forEach(status => {
      console.log(`  ${status}: ${statusByRole[role][status]} user(s)`);
    });
  });
  
  console.log('\n\nExpected Status Values:');
  console.log('----------------------');
  console.log('ADMIN: ACTIVE');
  console.log('TEACHER: ACTIVE');
  console.log('STUDENT: PENDING (before approval) or APPROVED (after approval)');
  
  console.log('\n\nIssues Found:');
  console.log('-------------');
  
  let issuesFound = false;
  
  // Check for students with ACTIVE status (should be APPROVED)
  const activeStudents = users.filter(u => u.role === 'STUDENT' && u.status === 'ACTIVE');
  if (activeStudents.length > 0) {
    console.log(`❌ ${activeStudents.length} student(s) with ACTIVE status (should be APPROVED):`);
    activeStudents.forEach(s => console.log(`   - ${s.name} (${s.username})`));
    issuesFound = true;
  }
  
  // Check for admin/teachers with APPROVED status (should be ACTIVE)
  const approvedStaff = users.filter(u => (u.role === 'ADMIN' || u.role === 'TEACHER') && u.status === 'APPROVED');
  if (approvedStaff.length > 0) {
    console.log(`❌ ${approvedStaff.length} admin/teacher(s) with APPROVED status (should be ACTIVE):`);
    approvedStaff.forEach(s => console.log(`   - ${s.name} (${s.username})`));
    issuesFound = true;
  }
  
  if (!issuesFound) {
    console.log('✅ No issues found! Status values are consistent.');
  }
  
  await prisma.$disconnect();
}

verifyStatusConsistency();
