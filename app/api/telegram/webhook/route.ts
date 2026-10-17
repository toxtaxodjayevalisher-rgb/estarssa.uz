import { NextResponse } from 'next/server';

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

export async function POST(req: Request) {
  try {
    const update = await req.json();

    const message = update.message || update.edited_message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat?.id;
    const text = message.text.trim();

    // /start, /start@estarssaBot, /start ...
    if (text === '/start' || text.startsWith('/start ') || text.startsWith('/start@')) {
      await sendTelegramReply(chatId, STARSSA_INFO_TEXT, message.message_id);
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

  return NextResponse.json({
    status: 'active',
    description: 'E-Starssa Telegram Webhook handler',
    commands: ['/start']
  });
}
