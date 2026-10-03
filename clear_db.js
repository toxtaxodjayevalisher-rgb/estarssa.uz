const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.homework.deleteMany({});
  console.log('Homework o`chirildi');
  
  await prisma.application.deleteMany({});
  console.log('Application o`chirildi');
  
  await prisma.attendanceArchive.deleteMany({});
  console.log('AttendanceArchive o`chirildi');
  
  await prisma.attendance.deleteMany({});
  console.log('Attendance Records o`chirildi');

  await prisma.attendanceSession.deleteMany({});
  console.log('Attendance Sessions o`chirildi');

  await prisma.notificationLog.deleteMany({});
  await prisma.telegramMessage.deleteMany({});
  console.log('Loglar o`chirildi');

  await prisma.student.deleteMany({});
  console.log('Students o`chirildi');
  
  console.log('Barcha qo`lda kiritilgan ma`lumotlar tozalandi! Faqat userlar (Ustoz, Starssa) qoldi.');
}
run().catch(console.error).finally(() => prisma.$disconnect());
