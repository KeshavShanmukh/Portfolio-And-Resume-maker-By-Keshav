const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

(async ()=>{
  try{
    const email = 'tester_js@example.com';
    const newPass = 'password123';
    const hashed = await bcrypt.hash(newPass, 10);
    const user = await prisma.user.update({ where: { email }, data: { password: hashed } });
    console.log('Updated user:', user.email);
    console.log('New password (plaintext):', newPass);
  }catch(e){console.error(e)}finally{await prisma.$disconnect()}
})();
