import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  const auth = await verifyAuth();
  if (!auth) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  try {
    // Bugungi sana (00:00 dan boshlab)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const session = await prisma.attendanceSession.findFirst({
      where: { date: today },
      include: {
        records: {
          include: { student: true }
        }
      }
    });

    if (!session) {
      return NextResponse.json({ 
        keldi: [], 
        kechikdi: [], 
        kelmadi: [],
        status: 'Boshlanmagan'
      });
    }

    const keldi = session.records.filter((r: any) => r.status === 'KELDI').map((r: any) => r.student);
    const kechikdi = session.records.filter((r: any) => r.status === 'KECHIKIB_KELDI').map((r: any) => r.student);
    const kelmadi = session.records.filter((r: any) => r.status === 'KELMADI').map((r: any) => r.student);

    return NextResponse.json({
      session_id: session.id,
      keldi,
      kechikdi,
      kelmadi,
      status: session.status
    });
  } catch(e) {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
