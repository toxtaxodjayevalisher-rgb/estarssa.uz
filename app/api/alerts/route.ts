import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. O'tgan 1 oydagi barcha kelmagan va kechikkanlarni olish
    const attendances = await prisma.attendance.findMany({
      where: {
        date: { gte: thirtyDaysAgo },
        status: { in: ['KELMADI', 'KECHIKIB_KELDI'] }
      }
    });

    const stats: Record<string, { kelmadi: number, kechikdi: number }> = {};
    attendances.forEach(a => {
      if (!stats[a.student_id]) stats[a.student_id] = { kelmadi: 0, kechikdi: 0 };
      if (a.status === 'KELMADI') stats[a.student_id].kelmadi++;
      if (a.status === 'KECHIKIB_KELDI') stats[a.student_id].kechikdi++;
    });

    // 2. Qoidabuzarlarni aniqlash va ariza (alert) yaratish
    for (const [student_id, counts] of Object.entries(stats)) {
      if (counts.kelmadi >= 3 || counts.kechikdi > 3) {
        // Oxirgi 1 oy ichida bu o'quvchi uchun ariza bormi?
        const existing = await prisma.application.findFirst({
          where: { 
            student_id, 
            created_at: { gte: thirtyDaysAgo },
            status: { in: ['YANGI', 'KECHIRILGAN', 'OGOHLANTIRILGAN'] } // already processed or pending
          }
        });

        if (!existing) {
          await prisma.application.create({
            data: {
              student_id,
              missed_count: counts.kelmadi + counts.kechikdi,
              reason: counts.kelmadi >= 3 ? "3 marta kelmagan" : "3 martadan ko'p kechikkan",
              status: 'YANGI'
            }
          });
        }
      }
    }

    // 3. Faqat YANGI (hal qilinmagan) ogohlantirishlarni qaytarish
    const alerts = await prisma.application.findMany({
      where: { status: 'YANGI' },
      include: {
        student: {
          include: {
            attendances: {
              where: {
                date: { gte: thirtyDaysAgo },
                status: { in: ['KELMADI', 'KECHIKIB_KELDI'] }
              },
              orderBy: { date: 'desc' }
            }
          }
        }
      }
    });

    return NextResponse.json(alerts);
  } catch (e) {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
