import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';
import { sendTelegramMessage } from '@/lib/telegram';

const STUDENT_GROUP_ID = '-1004395732727';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const auth = await verifyAuth(token);

    if (!auth || (auth.role !== 'STARSSA' && auth.role !== 'USTOZ' && auth.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { student_id, message, target } = await req.json();

    if (!student_id || !message || !message.trim()) {
      return NextResponse.json({ error: "O'quvchi va xabar matni kiritilishi shart" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id: student_id }
    });

    if (!student) {
      return NextResponse.json({ error: "O'quvchi topilmadi" }, { status: 404 });
    }

    const senderTitle = auth.role === 'STARSSA'
      ? `Starssa (${auth.full_name || auth.username})`
      : auth.role === 'USTOZ'
      ? `Ustoz (${auth.full_name || auth.username})`
      : `Ma'muriyat (${auth.username})`;

    // Check if student has a linked telegram_id
    let studentTelegramId: string | null = null;
    const cleanPhone = (student.phone || '').replace(/\D/g, '');
    const phoneSuffix = cleanPhone.length >= 7 ? cleanPhone.slice(-9) : '';

    if (phoneSuffix) {
      const userMatch = await prisma.user.findFirst({
        where: {
          telegram_id: { not: null },
          phone: { contains: phoneSuffix }
        }
      });
      if (userMatch?.telegram_id) {
        studentTelegramId = userMatch.telegram_id;
      }
    }

    if (!studentTelegramId) {
      const msgLog = await prisma.telegramMessage.findFirst({
        where: {
          telegram_id: { not: '' },
          message: { contains: student.full_name }
        },
        orderBy: { sent_at: 'desc' }
      });
      if (msgLog && !msgLog.telegram_id.startsWith('-')) {
        studentTelegramId = msgLog.telegram_id.split(',')[0];
      }
    }

    let destination = 'group';
    let targetChatId = STUDENT_GROUP_ID;

    if (target === 'direct' && studentTelegramId) {
      destination = 'direct';
      targetChatId = studentTelegramId;
    }

    let tgText = '';
    if (destination === 'direct') {
      tgText = `📩 <b>Sizga yangi xabar!</b>\n\n👤 <b>Hurmatli ${student.full_name}!</b>\n\n💬 ${message.trim()}\n\n<i>Yuboruvchi: ${senderTitle}</i>`;
    } else {
      tgText = `👤 <b>DIQQAT: ${student.full_name} (${student.group_name})</b>\n\n💬 ${message.trim()}\n\n<i>Yuboruvchi: ${senderTitle}</i>`;
    }

    await sendTelegramMessage(tgText, [targetChatId]);

    // Save to TelegramMessage history
    await prisma.telegramMessage.create({
      data: {
        sender_id: auth.id,
        telegram_id: targetChatId,
        message: tgText,
        message_type: destination === 'direct' ? 'STUDENT_DIRECT_MESSAGE' : 'STUDENT_GROUP_MESSAGE',
        status: 'SENT'
      }
    });

    return NextResponse.json({
      success: true,
      destination,
      student_name: student.full_name,
      sent_to: destination === 'direct' ? "O'quvchining shaxsiy Telegramiga" : "O'quvchilar guruhiga"
    });
  } catch (error: any) {
    console.error("Error sending student message:", error);
    return NextResponse.json({ error: "Server xatosi: " + error.message }, { status: 500 });
  }
}
