const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const students = [
  "Abbosov Jasur", "Aliyev Sardor", "Karimov Alisher", "Rustamov Doston", "Toshmatov Jamshid",
  "Qodirov Aziz", "Nazarov Bobur", "Yusupov Murod", "Ismoilov Timur", "Raimov Shoxruh",
  "Umarov Dilshod", "Mahmudov Sanjar", "Jalilov Bekzod", "Sodiqov Farhod", "Xalilov Asliddin",
  "Azizova Malika", "Karimova Sevara", "Aliyeva Shahnoza", "Rustamova Nigina", "Toshmatova Zebo",
  "Qodirova Madina", "Nazarova Iroda", "Yusupova Diyora", "Ismoilova Asal", "Raimova Shiringul",
  "Umarova Nilufar"
];

async function addStudents() {
  for (let i = 0; i < students.length; i++) {
    await prisma.student.create({
      data: {
        full_name: students[i],
        group_name: i < 13 ? '101-Guruh' : '102-Guruh',
        phone: `+998 90 123 45 \${(i+10).toString().padStart(2, '0')}`
      }
    });
  }
  console.log("26 ta o'quvchi bazaga qo'shildi!");
}

addStudents().catch(console.error).finally(() => prisma.$disconnect());
