import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  const auth = await verifyAuth();
  if (!auth) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  if (auth.role.toUpperCase() !== 'USTOZ') return NextResponse.json({ error: "Faqat USTOZ uchun" }, { status: 403 });

  try {
    // Ustoz faqat o'z guruhining davomatlarini ko'radi
    const where: any = { status: 'SENT_FOR_APPROVAL' };
    if (auth.assigned_group) {
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

export async function POST(req: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.role.toUpperCase() !== 'USTOZ') return NextResponse.json({ error: "Faqat USTOZ uchun" }, { status: 403 });

  try {
    const { session_id, action } = await req.json();

    if (action === 'approve') {
      const session = await prisma.attendanceSession.update({
        where: { id: session_id },
        data: {
          status: 'APPROVED',
          approved_by_id: auth.id,
          approved_at: new Date()
        }
      });
      const archiveExists = await prisma.attendanceArchive.findUnique({ where: { attendance_session_id: session.id } });
      if (!archiveExists) {
        await prisma.attendanceArchive.create({
          data: { attendance_session_id: session.id }
        });
      }
    } else if (action === 'redo') {
      await prisma.attendanceSession.update({
        where: { id: session_id },
        data: { status: 'DRAFT', submitted_at: null }
      });
    } else if (action === 'reject') {
      await prisma.attendance.deleteMany({ where: { session_id } });
      await prisma.attendanceSession.delete({ where: { id: session_id } });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Server xatosi: " + error.message }, { status: 500 });
  }
}
