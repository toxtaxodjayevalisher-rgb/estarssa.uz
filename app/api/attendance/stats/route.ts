import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  const auth = await verifyAuth();
  if (!auth) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  try {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const where: any = {
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    };

    if (auth.assigned_group) {
      where.OR = [
        { group_name: auth.assigned_group },
        { group_name: 'Barchasi' }
      ];
    }

    const session = await prisma.attendanceSession.findFirst({
      where,
      include: {
        records: {
          include: { student: true }
        }
      },
      orderBy: { submitted_at: 'desc' }
    });

    if (!session) {
      return NextResponse.json({ 
        keldi: [], 
        kechikdi: [], 
        sababli: [],
        kelmadi: [],
        records: [],
        status: 'Boshlanmagan'
      });
    }

    const keldi = session.records.filter((r: any) => r.status === 'KELDI').map((r: any) => r.student);
    const kechikdi = session.records.filter((r: any) => r.status === 'KECHIKIB_KELDI').map((r: any) => r.student);
    const sababli = session.records.filter((r: any) => r.status === 'UZR_LI').map((r: any) => r.student);
    const kelmadi = session.records.filter((r: any) => r.status === 'KELMADI').map((r: any) => r.student);

    return NextResponse.json({
      session_id: session.id,
      group_name: session.group_name,
      keldi,
      kechikdi,
      sababli,
      kelmadi,
      records: session.records,
      status: session.status
    });
  } catch(e) {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
