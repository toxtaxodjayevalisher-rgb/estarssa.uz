import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const token = process.env.TELEGRAM_BOT_TOKEN || '8983797302:AAHrMF0yZQ0qOgRGgE96SL6nV5hMKPdD_p4';

export const STARSSA_INFO_TEXT = `🌟 <b>E-STARSSA Tizimi Haqida Ma'lumot</b>

Assalomu alaykum!

<b>E-STARSSA</b> — bu guruh davomati, o'quv intizomi va kundalik faoliyatni nazorat qilish uchun yaratilgan qulay elektron platforma.

📌 <b>Asosiy imkoniyatlar:</b>
▫️ <b>📚 Uyga vazifalar:</b> Fanlar bo'yicha berilgan barcha topshiriqlar, darslik rasmlari va vazifalar shu guruhga muntazam yuboriladi.
▫️ <b>📢 E'lonlar va yangiliklar:</b> Muhim sanalar, tadbirlar va guruhga oid rasmiy xabarlar tezkor yetkaziladi.
▫️ <b>📋 Davomat nazorati:</b> Starssa (guruh sardori) davomatni elektron shaklda kiritadi, ustoz tekshirib tasdiqlaydi.
▫️ <b>⚠️ Intizom monitoringi:</b> Darsga kechikishlar, sababsiz kelmasliklar va qoidabuzarliklar hisobi yuritiladi.
▫️ <b>🎉 Tug'ilgan kunlar:</b> O'quvchilarning tavallud kunlari tizim orqali eslatib boriladi.

🌐 <b>Platforma veb-sayti:</b>
👉 https://e-starssauz.netlify.app/

<i>Tartib-intizom va darslarga mas'uliyat bilan yondashing!</i>`;

async function getLatestHomeworkMessage(groupName?: string) {
  const where: any = { status: 'ACTIVE' };
  if (groupName) {
    where.group_name = groupName;
  }

  const latest = await prisma.homework.findFirst({
    where,
    orderBy: { created_at: 'desc' }
  });

  if (!latest) {
    return {
      text: "ℹ️ <b>Hozircha tizimda faol uyga vazifalar mavjud emas.</b>",
      imageUrl: null
    };
  }

  const tasks = await prisma.homework.findMany({
    where: {
      group_name: latest.group_name,
      date: latest.date,
      status: 'ACTIVE'
    },
    orderBy: { created_at: 'asc' }
  });

  const d = new Date(latest.date);
  const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  const hwDate = `${days[d.getDay()]} (${d.getDate()}-${months[d.getMonth()]})`;

  let text = `📚 <b>Oxirgi uyga vazifalar:</b>\n\n📅 Sana: <b>${hwDate}</b>\n👥 Guruh: <b>${latest.group_name}</b>\n`;

  for (const t of tasks) {
    text += `\n📖 Fan: <b>${t.subject}</b>\n📝 Vazifa:\n${t.content}\n`;
  }

  if (latest.created_by) {
    text += `\n👤 Kiritdi: <b>${latest.created_by}</b>`;
  }

  const taskWithImage = tasks.find(t => t.image_url);
  const imageUrl = taskWithImage?.image_url || null;

  return { text, imageUrl };
}

async function sendTelegramReply(chatId: string | number, text: string, replyToMessageId?: number) {
  try {
    const body: any = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    };
    if (replyToMessageId) {
      body.reply_parameters = { message_id: replyToMessageId };
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (error) {
    console.error('Error sending telegram reply:', error);
    return null;
  }
}

async function sendHomeworkReply(chatId: string | number, replyToMessageId?: number, groupName?: string) {
  const { text, imageUrl } = await getLatestHomeworkMessage(groupName);

  if (imageUrl && imageUrl.startsWith('data:image/')) {
    try {
      const base64Data = imageUrl.split(';base64,').pop();
      if (base64Data) {
        const buffer = Buffer.from(base64Data, 'base64');
        const formData = new FormData();
        formData.append('chat_id', chatId.toString());
        formData.append('caption', text);
        formData.append('parse_mode', 'HTML');
        if (replyToMessageId) {
          formData.append('reply_parameters', JSON.stringify({ message_id: replyToMessageId }));
        }
        formData.append('photo', new Blob([buffer], { type: 'image/jpeg' }), 'homework.jpg');

        const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          return await res.json();
        } else {
          console.error('Photo send failed, fallback to text:', await res.text());
        }
      }
    } catch (err) {
      console.error('Error preparing homework photo, falling back to text:', err);
    }
  }

  return await sendTelegramReply(chatId, text, replyToMessageId);
}

export async function POST(req: Request) {
  try {
    const update = await req.json();

    const message = update.message || update.edited_message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat?.id;
    const text = message.text.trim();
    const lowerText = text.toLowerCase();

    // /start, /start@estarssaBot
    if (lowerText === '/start' || lowerText.startsWith('/start ') || lowerText.startsWith('/start@')) {
      await sendTelegramReply(chatId, STARSSA_INFO_TEXT, message.message_id);
    } 
    // /hw, /hw@estarssaBot, /vazifa, /homework
    else if (
      lowerText === '/hw' ||
      lowerText.startsWith('/hw ') ||
      lowerText.startsWith('/hw@') ||
      lowerText === '/vazifa' ||
      lowerText.startsWith('/vazifa ') ||
      lowerText.startsWith('/vazifa@') ||
      lowerText === '/homework' ||
      lowerText.startsWith('/homework ') ||
      lowerText.startsWith('/homework@')
    ) {
      await sendHomeworkReply(chatId, message.message_id);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true, error: error.message });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'setWebhook') {
    const webhookUrl = 'https://e-starssauz.netlify.app/api/telegram/webhook';
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}&drop_pending_updates=true`);
    const data = await res.json();
    return NextResponse.json(data);
  }

  if (action === 'getWebhookInfo') {
    const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const data = await res.json();
    return NextResponse.json(data);
  }

  if (action === 'demo') {
    const targetChat = searchParams.get('chat_id') || '-1004395732727';
    const result = await sendTelegramReply(targetChat, STARSSA_INFO_TEXT);
    return NextResponse.json({ demo_sent: true, result });
  }

  if (action === 'demo_hw' || action === 'hw') {
    const targetChat = searchParams.get('chat_id') || '-1004395732727';
    const result = await sendHomeworkReply(targetChat);
    return NextResponse.json({ demo_hw_sent: true, result });
  }

  return NextResponse.json({
    status: 'active',
    description: 'E-Starssa Telegram Webhook handler',
    commands: ['/start', '/hw']
  });
}
