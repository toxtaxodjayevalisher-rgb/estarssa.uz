import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: Request) {
  const auth = await verifyAuth();
  if (!auth) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  try {
    // Filter by role
    const where: any = {};
    if (auth.role.toUpperCase() === 'USTOZ' && auth.assigned_group) {
      where.group_name = auth.assigned_group;
    } else if (auth.role.toUpperCase() === 'STARSSA' && auth.assigned_group) {
      where.group_name = auth.assigned_group;
    }

    const sessions = await prisma.attendanceSession.findMany({
      where,
      include: {
        records: { include: { student: true } }
      },
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(sessions);
  } catch(e) {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
