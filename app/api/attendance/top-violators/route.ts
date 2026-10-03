import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: Request) {
  const auth = await verifyAuth();
  if (!auth) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendances = await prisma.attendance.findMany({
      where: {
        date: { gte: thirtyDaysAgo },
        status: { in: ['KELMADI', 'KECHIKIB_KELDI'] }
      },
      include: {
        student: true,
        session: true
      },
      orderBy: { date: 'desc' }
    });

    const studentMap = new Map();

    attendances.forEach(a => {
      if (!studentMap.has(a.student_id)) {
        studentMap.set(a.student_id, {
          student: a.student,
          total_violations: 0,
          records: []
        });
      }
      
      const s = studentMap.get(a.student_id);
      s.total_violations += 1;
      s.records.push({
        id: a.id,
        date: a.date,
        status: a.status,
        note: a.note || ''
      });
    });

    const topViolators = Array.from(studentMap.values())
      .sort((a, b) => b.total_violations - a.total_violations)
      .slice(0, 5);

    return NextResponse.json(topViolators);
  } catch(e) {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
