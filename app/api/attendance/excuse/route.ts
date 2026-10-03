import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: Request) {
  const auth = await verifyAuth();
  if (!auth) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  try {
    const data = await req.json();
    const { attendance_id } = data;

    // Fetch the attendance record
    const record = await prisma.attendance.findUnique({ where: { id: attendance_id } });
    if (!record) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

    const note = (record.note || '').toLowerCase();
    const isSpecialReason = note.includes('kasal') || note.includes('o\'lim') || note.includes('olim');

    if (isSpecialReason && auth.role !== 'USTOZ') {
      return NextResponse.json({ error: "Kasallik yoki o'lim bilan bog'liq sabablarni faqat USTOZ bekor qila oladi!" }, { status: 403 });
    }

    // Bekor qilish (mark as Excused)
    await prisma.attendance.update({
      where: { id: attendance_id },
      data: { status: 'UZR_LI' }
    });

    return NextResponse.json({ success: true });
  } catch(e) {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
