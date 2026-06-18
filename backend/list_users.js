const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, createdAt: true },
      orderBy: { id: 'asc' }
    });
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log('Users:');
      users.forEach(u => {
        console.log(`- id: ${u.id}, username: ${u.username}, email: ${u.email}, createdAt: ${u.createdAt}`);
      });
    }
  } catch (err) {
    console.error('Error fetching users:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
