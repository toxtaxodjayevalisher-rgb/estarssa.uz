const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function run() {
  const users = [
    {
      username: 'Shahnozateacher',
      passwordPlain: 'Shm0007@',
      role: 'USTOZ',
      full_name: 'Bosh Ustoz (Shahnoza)'
    },
    {
      username: 'xumyunmirzo',
      passwordPlain: 'thexumo00',
      role: 'STARSSA',
      full_name: 'Xumoyunmirzo (Asosiy sardor)'
    },
    {
      username: 'moxinur',
      passwordPlain: 'themoxinur081',
      role: 'STARSSA',
      full_name: 'Mohinur (Qizlarning sardori)'
    }
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.passwordPlain, 10);
    await prisma.user.upsert({
      where: { username: u.username },
      update: {
        password_hash: hash,
        role: u.role,
        full_name: u.full_name
      },
      create: {
        username: u.username,
        password_hash: hash,
        role: u.role,
        full_name: u.full_name,
        status: 'ACTIVE'
      }
    });
    console.log('Upserted ' + u.username);
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
