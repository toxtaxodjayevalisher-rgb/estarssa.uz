import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { sendTelegramMessage } from '@/lib/telegram';

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth((await cookies()).get('token')?.value);
    if (!auth || auth.role !== 'ADMIN') return NextResponse.json({ error: 'Ruxsat etilmagan' }, { status: 403 });

    const { id } = await params;
    
    const session = await prisma.attendanceSession.update({
      where: { id },
      data: { status: 'DRAFT', approved_by_id: null, approved_at: null },
      include: { created_by: true }
    });
    
    if (session.created_by?.telegram_id) {
       await sendTelegramMessage(\`⚠️ Admin davomatni qaytardi! Iltimos \${new Date(session.date).toLocaleDateString()} dagi \${session.group_name} guruhi davomatini qaytadan tekshirib yuboring.\`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth((await cookies()).get('token')?.value);
    if (!auth || auth.role !== 'ADMIN') return NextResponse.json({ error: 'Ruxsat etilmagan' }, { status: 403 });

    const { id } = await params;
    await prisma.attendanceSession.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 });
  }
}
