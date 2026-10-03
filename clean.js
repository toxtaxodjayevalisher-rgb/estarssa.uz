const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  await prisma.attendanceArchive.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.attendanceSession.deleteMany({});
  console.log("Tozalandi");
}

clean();
