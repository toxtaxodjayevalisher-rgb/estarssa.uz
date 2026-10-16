import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: Request) {
  const auth = await verifyAuth();
  if (!auth) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  try {
    const where: any = {};
    if (auth.assigned_group) {
      where.OR = [
        { group_name: auth.assigned_group },
        { group_name: 'Barchasi' }
      ];
    }

    const sessions = await prisma.attendanceSession.findMany({
      where,
      include: {
        records: { 
          include: { student: true },
          orderBy: { student: { full_name: 'asc' } }
        }
      },
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(sessions);
  } catch(e) {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
