const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function run() {
  const username = 'Alisher';
  const password = 'Alisher86438(';
  const hash = await bcrypt.hash(password, 10);
  
  await prisma.user.upsert({
    where: { username },
    update: {
      password_hash: hash,
      role: 'ADMIN',
      full_name: 'Admin Alisher'
    },
    create: {
      username,
      password_hash: hash,
      role: 'ADMIN',
      full_name: 'Admin Alisher'
    }
  });
  console.log('Admin user created/updated successfully!');
}

run().catch(console.error).finally(() => prisma.$disconnect());
