const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

function genPassword(len = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
  let out = '';
  const rnd = crypto.randomBytes(len);
  for (let i = 0; i < len; i++) {
    out += chars[rnd[i] % chars.length];
  }
  return out;
}

(async () => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, username: true } });
    if (!users.length) {
      console.log('No users to reset.');
      return;
    }

    console.log('Resetting passwords for users:');
    for (const u of users) {
      const newPass = genPassword(14);
      const hashed = await bcrypt.hash(newPass, 10);
      await prisma.user.update({ where: { id: u.id }, data: { password: hashed } });
      console.log(`- ${u.email} -> ${newPass}`);
    }
    console.log('\nPasswords updated. Use these credentials to login, then change them as needed.');
  } catch (err) {
    console.error('Error resetting passwords:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
