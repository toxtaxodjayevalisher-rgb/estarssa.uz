import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { deleteTelegramMessage } from '@/lib/telegram';

const prisma = new PrismaClient();

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth((await cookies()).get('token')?.value);
    if (!auth || (auth.role !== 'ADMIN' && auth.role !== 'USTOZ')) {
      return NextResponse.json({ error: 'Ruxsat etilmagan' }, { status: 403 });
    }

    const { id } = await params;
    
    // Find announcement to get telegram_msg_ids
    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });

    // Delete from Telegram
    if (announcement.telegram_msg_ids) {
      try {
        const msgIds = JSON.parse(announcement.telegram_msg_ids);
        for (const msg of msgIds) {
          await deleteTelegramMessage(msg.chatId, msg.messageId);
        }
      } catch (e) {
        console.error("Telegram xabarlarini o'chirishda xato:", e);
      }
    }

    // Delete from DB
    await prisma.announcement.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
