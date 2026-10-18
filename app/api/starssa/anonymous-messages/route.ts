import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';
import { sendTelegramMessage } from '@/lib/telegram';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const auth = await verifyAuth(token);

    if (!auth || (auth.role !== 'STARSSA' && auth.role !== 'USTOZ' && auth.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const messages = await prisma.anonymousMessage.findMany({
      orderBy: { created_at: 'desc' }
    });

    // Hide telegram_chat_id for privacy
    const safeMessages = messages.map(m => ({
      id: m.id,
      sender_name: m.sender_name || "Anonim o'quvchi",
      group_name: m.group_name || "104-guruh",
      message: m.message,
      reply: m.reply,
      replied_at: m.replied_at,
      replied_by: m.replied_by,
      status: m.status,
      created_at: m.created_at
    }));

    return NextResponse.json({ messages: safeMessages });
  } catch (error: any) {
    console.error('Error fetching anonymous messages:', error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const auth = await verifyAuth(token);

    if (!auth || (auth.role !== 'STARSSA' && auth.role !== 'USTOZ' && auth.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { message_id, reply } = await req.json();

    if (!message_id || !reply || !reply.trim()) {
      return NextResponse.json({ error: "Xabar ID va javob matni kiritilishi shart" }, { status: 400 });
    }

    const targetMsg = await prisma.anonymousMessage.findUnique({
      where: { id: message_id }
    });

    if (!targetMsg) {
      return NextResponse.json({ error: "Xabar topilmadi" }, { status: 404 });
    }

    const responderName = auth.role === 'STARSSA' 
      ? `Starssa (${auth.full_name || 'Guruh sardori'})`
      : `${auth.role} (${auth.full_name || auth.username})`;

    // Update in DB
    const updated = await prisma.anonymousMessage.update({
      where: { id: message_id },
      data: {
        reply: reply.trim(),
        replied_at: new Date(),
        replied_by: responderName,
        status: 'REPLIED'
      }
    });

    // Send answer to student via Telegram bot
    const studentNotification = `📬 <b>Starssadan javob xabari!</b>\n\n` +
      `Siz yuborgan anonim xabar:\n` +
      `<i>«${targetMsg.message}»</i>\n\n` +
      `💬 <b>Javob:</b>\n` +
      `<b>${reply.trim()}</b>\n\n` +
      `👤 <i>${responderName}</i>\n` +
      `<i>E-STARSSA Tizimi</i>`;

    await sendTelegramMessage(targetMsg.telegram_chat_id, studentNotification);

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    console.error('Error replying to anonymous message:', error);
    return NextResponse.json({ error: "Server xatosi: " + error.message }, { status: 500 });
  }
}
