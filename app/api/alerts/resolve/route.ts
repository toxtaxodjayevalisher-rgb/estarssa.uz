import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.role.toUpperCase() !== 'USTOZ') {
    return NextResponse.json({ error: "Buni faqat USTOZ hal qila oladi" }, { status: 403 });
  }

  try {
    const { alert_id, action } = await req.json();

    const app = await prisma.application.findUnique({
      where: { id: alert_id },
      include: { student: true }
    });

    if (!app) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

    if (action === 'excuse') {
      await prisma.application.update({
        where: { id: alert_id },
        data: { status: 'KECHIRILGAN' }
      });
      // Barcha shu oydagi xatolarni UZR_LI qilib qo'yamiz (ular qayta jazolanmasligi uchun)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      await prisma.attendance.updateMany({
        where: { 
          student_id: app.student_id, 
          date: { gte: thirtyDaysAgo },
          status: { in: ['KELMADI', 'KECHIKIB_KELDI'] }
        },
        data: { status: 'UZR_LI' }
      });
    } else if (action === 'warn') {
      await prisma.application.update({
        where: { id: alert_id },
        data: { status: 'OGOHLANTIRILGAN' }
      });
      // Telegramdan xabar yuborish logikasi shu yerda bo'lishi mumkin
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
