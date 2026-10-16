import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    // Get current date in Asia/Tashkent (UTC+5)
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tashkent',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const [tYear, tMonth, tDay] = formatter.format(now).split('-').map(Number);

    const students = await prisma.student.findMany({
      where: {
        status: 'ACTIVE',
        birth_date: { not: null }
      },
      select: {
        id: true,
        full_name: true,
        group_name: true,
        phone: true,
        birth_date: true
      }
    });

    const birthdays = students
      .filter(s => {
        if (!s.birth_date) return false;
        const b = new Date(s.birth_date);
        const bMonthUTC = b.getUTCMonth() + 1;
        const bDayUTC = b.getUTCDate();
        const bMonthLocal = b.getMonth() + 1;
        const bDayLocal = b.getDate();

        return (
          (bMonthUTC === tMonth && bDayUTC === tDay) ||
          (bMonthLocal === tMonth && bDayLocal === tDay)
        );
      })
      .map(s => {
        const b = new Date(s.birth_date!);
        const bYear = b.getUTCFullYear() || b.getFullYear();
        const age = tYear - bYear;
        return {
          id: s.id,
          full_name: s.full_name,
          group_name: s.group_name,
          phone: s.phone,
          birth_date: s.birth_date,
          age: age > 0 ? age : undefined,
          text: `Bugun ${s.full_name} ismli o'quvchining tug'ilgan kuni!`
        };
      });

    return NextResponse.json({ birthdays });
  } catch (error) {
    console.error("Birthday check error:", error);
    return NextResponse.json({ birthdays: [] });
  }
}
