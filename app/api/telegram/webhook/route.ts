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

const START_KEYBOARD = {
  inline_keyboard: [
    [
      {
        text: '📱 Oynani ochish (F.I.SH & Guruh)',
        web_app: { url: 'https://e-starssauz.netlify.app/telegram/profile' }
      }
    ],
    [
      {
        text: '🌐 E-STARSSA Saytiga kirish',
        url: 'https://e-starssauz.netlify.app/'
      }
    ]
  ]
};

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

async function sendTelegramReply(
  chatId: string | number,
  text: string,
  replyToMessageId?: number,
  replyMarkup?: any
) {
  try {
    const body: any = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    };
    if (replyToMessageId) {
      body.reply_parameters = { message_id: replyToMessageId };
    }
    if (replyMarkup) {
      body.reply_markup = replyMarkup;
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

async function handleHelpCommand(
  chatId: string | number,
  messageId?: number,
  from?: any,
  chatTitle?: string
) {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  const recent = await prisma.telegramMessage.findFirst({
    where: {
      message_type: 'HELP_HOMEWORK_REQUEST',
      sent_at: { gte: twoMinutesAgo }
    }
  });

  if (recent) {
    return await sendTelegramReply(
      chatId,
      `⏳ <b>Eslatma yaqinda yuborilgan!</b>\n\nSardorga (Starssa) uyga vazifani kiritish bo'yicha so'rov allaqachon yetkazilgan. Iltimos, biroz kuting.`,
      messageId
    );
  }

  const senderName = from
    ? `${from.first_name || ''} ${from.last_name || ''}`.trim() + (from.username ? ` (@${from.username})` : '')
    : "O'quvchi";
  const groupName = chatTitle || "O'quvchilar guruhi";

  const starssaAlert = `🔔 <b>DIQQAT, HURMATLI STARSSA!</b>\n\nGuruh o'quvchilari tomonidan <b>/help</b> buyrug'i orqali yangi uyga vazifani yuklash so'raldi!\n\n👤 <b>So'rov yubordi:</b> ${senderName}\n👥 <b>Guruh:</b> ${groupName}\n\nIltimos, bugungi fanlar bo'yicha uyga vazifalarni tizimga kiriting va guruhga jo'nating:\n👉 https://e-starssauz.netlify.app/starssa/homework`;

  const starssaUsers = await prisma.user.findMany({
    where: { role: 'STARSSA', telegram_id: { not: null } }
  });

  const starssaChatIds = new Set<string>();
  // Foydalanuvchi talabiga ko'ra Starssalar lichkasi:
  starssaChatIds.add('6820579298'); // Mohinur lichkasi
  starssaChatIds.add('1973751873'); // Alisher lichkasi

  for (const u of starssaUsers) {
    if (u.telegram_id) starssaChatIds.add(u.telegram_id);
  }

  for (const sChatId of starssaChatIds) {
    await sendTelegramReply(sChatId, starssaAlert);
  }

  await prisma.telegramMessage.create({
    data: {
      telegram_id: Array.from(starssaChatIds).join(','),
      message: starssaAlert,
      message_type: 'HELP_HOMEWORK_REQUEST',
      status: 'SENT'
    }
  });

  return await sendTelegramReply(
    chatId,
    `✅ <b>Uyga vazifa so'rovi yuborildi!</b>\n\nGuruh sardoriga (Starssa) yangi uyga vazifalarni kiritish bo'yicha eslatma yetkazildi. Vazifalar kiritilishi bilan guruhga xabar boradi!`,
    messageId
  );
}

async function handlePrivateSearch(chatId: string | number, text: string, messageId?: number) {
  const cleanPhone = text.replace(/\D/g, '');
  const phoneSuffix = cleanPhone.length >= 7 ? cleanPhone.slice(-9) : '';
  const qName = text.trim().toLowerCase();

  const allUsers = await prisma.user.findMany();
  const allStudents = await prisma.student.findMany();

  let matched: any = null;

  if (phoneSuffix) {
    const uMatch = allUsers.find(u => (u.phone || '').replace(/\D/g, '').endsWith(phoneSuffix));
    if (uMatch) {
      matched = {
        name: uMatch.full_name,
        group: uMatch.assigned_group || 'Barchasi',
        role: uMatch.role === 'STARSSA' ? 'Starssa (Guruh sardori)' : uMatch.role === 'USTOZ' ? 'Ustoz (O\'qituvchi)' : 'Admin',
        phone: uMatch.phone
      };
    } else {
      const sMatch = allStudents.find(s => (s.phone || '').replace(/\D/g, '').endsWith(phoneSuffix));
      if (sMatch) {
        const isStarssa = allUsers.some(u =>
          u.role === 'STARSSA' && (
            u.full_name.toLowerCase().includes(sMatch.full_name.toLowerCase()) ||
            sMatch.full_name.toLowerCase().includes(u.full_name.toLowerCase())
          )
        );
        matched = {
          name: sMatch.full_name,
          group: sMatch.group_name,
          role: isStarssa ? 'Starssa (Guruh sardori)' : "O'quvchi",
          phone: sMatch.phone
        };
      }
    }
  }

  if (!matched && qName.length >= 3) {
    const uMatch = allUsers.find(u => u.full_name.toLowerCase().includes(qName) || qName.includes(u.full_name.toLowerCase()));
    if (uMatch) {
      matched = {
        name: uMatch.full_name,
        group: uMatch.assigned_group || 'Barchasi',
        role: uMatch.role === 'STARSSA' ? 'Starssa (Guruh sardori)' : uMatch.role === 'USTOZ' ? 'Ustoz (O\'qituvchi)' : 'Admin',
        phone: uMatch.phone
      };
    } else {
      const sMatch = allStudents.find(s => s.full_name.toLowerCase().includes(qName) || qName.includes(s.full_name.toLowerCase()));
      if (sMatch) {
        const isStarssa = allUsers.some(u =>
          u.role === 'STARSSA' && (
            u.full_name.toLowerCase().includes(sMatch.full_name.toLowerCase()) ||
            sMatch.full_name.toLowerCase().includes(u.full_name.toLowerCase())
          )
        );
        matched = {
          name: sMatch.full_name,
          group: sMatch.group_name,
          role: isStarssa ? 'Starssa (Guruh sardori)' : "O'quvchi",
          phone: sMatch.phone
        };
      }
    }
  }

  if (matched) {
    const replyText = `✅ <b>Sizning ma'lumotlaringiz:</b>\n\n👤 <b>F.I.SH:</b> ${matched.name}\n👥 <b>Guruhi:</b> <b>${matched.group}</b>\n🎓 <b>Roli:</b> <b>${matched.role}</b>\n📞 <b>Telefon:</b> ${matched.phone || 'Kiritilmagan'}\n\n<i>Batafsil ma'lumot olish yoki oyna orqali ko'rish uchun quyidagi tugmani bosing:</i>`;
    await sendTelegramReply(chatId, replyText, messageId, START_KEYBOARD);
  } else if (cleanPhone.length >= 7 || qName.length >= 3) {
    const notFoundText = `❌ <b>Kiritilgan ma'lumot bo'yicha o'quvchi yoki xodim topilmadi.</b>\n\nIltimos, F.I.SH yoki telefon raqamingizni tekshirib qaytadan yozing, yoki quyidagi tugma orqali oynani oching:`;
    await sendTelegramReply(chatId, notFoundText, messageId, START_KEYBOARD);
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
    const lowerText = text.toLowerCase();

    // /start, /start@estarssaBot
    if (lowerText === '/start' || lowerText.startsWith('/start ') || lowerText.startsWith('/start@')) {
      const welcomeText = `🌟 <b>Assalomu alaykum! E-STARSSA tizimiga xush kelibsiz!</b>\n\n<b>E-STARSSA</b> — bu guruh davomati, o'quv intizomi va kundalik faoliyatni nazorat qilish platformasi.\n\nO'quvchi ma'lumotlarini tekshirish, qaysi guruhda o'qishingiz va rolingizni bilish uchun quyidagi <b>"Oynani ochish 📱"</b> tugmasini bosing:`;
      await sendTelegramReply(chatId, welcomeText, message.message_id, START_KEYBOARD);
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
    // /help, /help@estarssaBot, /yordam
    else if (
      lowerText === '/help' ||
      lowerText.startsWith('/help ') ||
      lowerText.startsWith('/help@') ||
      lowerText === '/yordam' ||
      lowerText.startsWith('/yordam ') ||
      lowerText.startsWith('/yordam@')
    ) {
      await handleHelpCommand(chatId, message.message_id, message.from, message.chat?.title);
    }
    // Shaxsiy chatda ism yoki telefon kiritilsa
    else if (message.chat?.type === 'private' && !text.startsWith('/')) {
      await handlePrivateSearch(chatId, text, message.message_id);
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
    const result = await sendTelegramReply(targetChat, STARSSA_INFO_TEXT, undefined, START_KEYBOARD);
    return NextResponse.json({ demo_sent: true, result });
  }

  if (action === 'demo_hw' || action === 'hw') {
    const targetChat = searchParams.get('chat_id') || '-1004395732727';
    const result = await sendHomeworkReply(targetChat);
    return NextResponse.json({ demo_hw_sent: true, result });
  }

  if (action === 'demo_help' || action === 'help') {
    const targetChat = searchParams.get('chat_id') || '-1004395732727';
    const result = await handleHelpCommand(targetChat, undefined, { first_name: "O'quvchi (Demo)" }, 'Уй иши');
    return NextResponse.json({ demo_help_sent: true, result });
  }

  if (action === 'setMenuButton') {
    const res = await fetch(`https://api.telegram.org/bot${token}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: 'Tizimga kirish',
          web_app: {
            url: 'https://e-starssauz.netlify.app/login'
          }
        }
      })
    });
    const data = await res.json();
    return NextResponse.json(data);
  }

  return NextResponse.json({
    status: 'active',
    description: 'E-Starssa Telegram Webhook handler',
    commands: ['/start', '/hw', '/help']
  });
}
