import { PrismaClient } from '../node_modules/.prisma/client/index.js';

const db = new PrismaClient();

async function main() {
  console.log('=== KIỂM TRA VÀ SETUP USER chucnguyen ===\n');

  // List all admin users
  const users = await db.adminUser.findMany({
    select: { id: true, username: true, displayName: true, email: true, role: true, isActive: true }
  });

  console.log('Danh sách AdminUser hiện tại:');
  users.forEach(u => {
    console.log(`  - ${u.username} | role=${u.role} | email=${u.email || '(chưa có)'} | active=${u.isActive}`);
  });

  // Find chucnguyen
  const chucnguyen = users.find(u => u.username === 'chucnguyen');
  if (!chucnguyen) {
    console.log('\n⚠️  Không tìm thấy user chucnguyen. Kiểm tra DASHBOARD_USERNAME trong .env.local...');
    // Check if it's the env-based super admin - it should have been upserted on first login
    console.log('Thử tìm theo role SUPER_ADMIN...');
    const superAdmins = users.filter(u => u.role === 'SUPER_ADMIN');
    console.log('SUPER_ADMIN users:', superAdmins.map(u => u.username));
  } else {
    console.log(`\n✅ Tìm thấy: chucnguyen | role=${chucnguyen.role} | id=${chucnguyen.id}`);
    
    // Set email
    const updated = await db.adminUser.update({
      where: { id: chucnguyen.id },
      data: { email: 'contract.gedeco@gmail.com' }
    });
    console.log(`✅ Đã set email: ${updated.email}`);
  }

  // Also check .env.local for DASHBOARD_USERNAME
  console.log('\n=== Kiểm tra xong ===');
}

main()
  .catch(e => { console.error('ERROR:', e.message); process.exit(1); })
  .finally(() => db.$disconnect());
