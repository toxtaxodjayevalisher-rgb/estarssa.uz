const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const password_hash = await bcrypt.hash('123456', 10);
  
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password_hash, role: 'ADMIN', full_name: 'Asosiy Admin' }
  });

  await prisma.user.upsert({
    where: { username: 'starssa' },
    update: {},
    create: { username: 'starssa', password_hash, role: 'STARSSA', full_name: 'Starssa Xodim' }
  });

  await prisma.user.upsert({
    where: { username: 'ustoz' },
    update: {},
    create: { username: 'ustoz', password_hash, role: 'USTOZ', full_name: 'Bosh Ustoz' }
  });

  console.log('Seed yakunlandi.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());