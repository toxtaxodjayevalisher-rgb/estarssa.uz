import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const CURRENT_BOT_TOKEN = '8983797302:AAFBsLv62LUEQPsmqZCIzyTmXA_UIpJx5hQ';
const token = (process.env.TELEGRAM_BOT_TOKEN && !process.env.TELEGRAM_BOT_TOKEN.includes('AAHrMF0y'))
  ? process.env.TELEGRAM_BOT_TOKEN
  : CURRENT_BOT_TOKEN;
const STUDENT_GROUP_ID = '-1004395732727';

export const STARSSA_INFO_TEXT = `🌟 <b>E-STARSSA Tizimi Haqida Ma'lumot</b>

Assalomu alaykum!

<b>E-STARSSA</b> — bu guruh davomati, o'quv intizomi va kundalik faoliyatni nazorat qilish uchun yaratilgan qulay elektron platforma.

📌 <b>Asosiy imkoniyatlar:</b>
▫️ 📚 <b>Uyga vazifalar:</b> Fanlar bo'yicha berilgan barcha topshiriqlar shu guruhga muntazam yuboriladi.
▫️ 📢 <b>E'lonlar va yangiliklar:</b> Muhim sanalar va tadbirlar yetkaziladi.
▫️ 📋 <b>Davomat nazorati:</b> Starssa davomatni kiritadi, ustoz tasdiqlaydi.
▫️ ⚠️ <b>Intizom monitoringi:</b> Darsga kechikishlar va intizom hisobi yuritiladi.

🌐 <b>Platforma veb-sayti:</b>
👉 https://e-starssa.netlify.app/`;

export const BOT_MENU_KEYBOARD = {
  keyboard: [
    [
      { text: '📱 Telefon raqamni yuborish', request_contact: true }
    ],
    [
      { text: '✍️ Uyga vazifani o\'zi kiritish' },
      { text: '🕵️ Starssaga anonim xabar' }
    ],
    [
      { text: '📚 Oxirgi vazifalar (/hw)' }
    ]
  ],
  resize_keyboard: true,
  is_persistent: true
};

const CANCEL_KEYBOARD = {
  keyboard: [
    [{ text: '❌ Bekor qilish (/cancel)' }]
  ],
  resize_keyboard: true,
  one_time_keyboard: true
};

async function getBotSession(chatId: string | number) {
  const cId = String(chatId);
  try {
    let session = await prisma.botSession.findUnique({ where: { chat_id: cId } });
    if (!session) {
      session = await prisma.botSession.create({
        data: { chat_id: cId, state: 'IDLE' }
      });
    }
    return session;
  } catch (e) {
    console.error('getBotSession error:', e);
    return { chat_id: cId, state: 'IDLE', student_name: null, group_name: null };
  }
}

async function updateBotSession(
  chatId: string | number,
  data: { state?: string; data?: string; student_name?: string; group_name?: string }
) {
  const cId = String(chatId);
  try {
    return await prisma.botSession.upsert({
      where: { chat_id: cId },
      update: data,
      create: { chat_id: cId, ...data }
    });
  } catch (e) {
    console.error('updateBotSession error:', e);
    return null;
  }
}

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

async function deleteTelegramMessage(chatId: string | number, messageId: number) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/deleteMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId })
    });
    return await res.json();
  } catch (error) {
    console.error('Error deleting telegram message:', error);
    return null;
  }
}

async function sendHomeworkReply(chatId: string | number, replyToMessageId?: number, groupName?: string) {
  const { text, imageUrl } = await getLatestHomeworkMessage(groupName);

  if (imageUrl && imageUrl.startsWith('telegram:')) {
    const fileId = imageUrl.replace('telegram:', '');
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: fileId,
          caption: text,
          parse_mode: 'HTML',
          reply_parameters: replyToMessageId ? { message_id: replyToMessageId } : undefined
        })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error('Error sending telegram photo file_id in homework:', err);
    }
  }

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

  const starssaAlert = `🔔 <b>DIQQAT, HURMATLI STARSSA!</b>\n\nGuruh o'quvchilari tomonidan <b>/help</b> buyrug'i orqali yangi uyga vazifani yuklash so'raldi!\n\n👤 <b>So'rov yubordi:</b> ${senderName}\n👥 <b>Guruh:</b> ${groupName}\n\nIltimos, bugungi fanlar bo'yicha uyga vazifalarni tizimga kiriting va guruhga jo'nating:\n👉 https://e-starssa.netlify.app/starssa/homework`;

  const starssaUsers = await prisma.user.findMany({
    where: { role: 'STARSSA', telegram_id: { not: null } }
  });

  const starssaChatIds = new Set<string>();
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

async function handleContact(chatId: string | number, contact: any, messageId?: number) {
  const rawPhone = contact.phone_number || '';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const phoneSuffix = cleanPhone.length >= 7 ? cleanPhone.slice(-9) : cleanPhone;

  const allUsers = await prisma.user.findMany();
  const allStudents = await prisma.student.findMany();

  let matched: any = null;

  if (phoneSuffix) {
    const uMatch = allUsers.find(u => (u.phone || '').replace(/\D/g, '').endsWith(phoneSuffix));
    if (uMatch) {
      matched = {
        name: uMatch.full_name,
        group: uMatch.assigned_group || 'Barchasi',
        role: uMatch.role === 'STARSSA' ? 'Starssa (Guruh sardori)' : uMatch.role === 'USTOZ' ? 'Ustoz (O\'qituvchi)' : 'Admin (Boshqaruvchi)',
        phone: uMatch.phone || rawPhone
      };
      await prisma.user.update({
        where: { id: uMatch.id },
        data: { telegram_id: String(chatId) }
      }).catch(() => {});
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
          phone: sMatch.phone || rawPhone
        };
      }
    }
  }

  if (matched) {
    await updateBotSession(chatId, {
      student_name: matched.name,
      group_name: matched.group,
      state: 'IDLE'
    });

    const isStudent = matched.role === "O'quvchi";
    let roleNotice = '';
    if (isStudent) {
      roleNotice = `\n\n📌 <b>Hurmatli o'quvchi!</b> Saytga faqat Starssa, Ustoz va Adminlar kira oladi. O'quvchilar saytdan ro'yxatdan o'tmaydi. Barcha uyga vazifalar va e'lonlar guruhingizda berib boriladi.`;
    } else {
      roleNotice = `\n\n🔐 <b>Siz tizim mas'ulisiz:</b> Saytga kirish uchun quyidagi havoladan foydalaning:\n👉 https://e-starssauz.netlify.app/login`;
    }

    const replyText = `✅ <b>Sizning ma'lumotlaringiz:</b>\n\n👤 <b>F.I.SH:</b> ${matched.name}\n👥 <b>Guruhi:</b> <b>${matched.group}</b>\n🎓 <b>Roli:</b> <b>${matched.role}</b>\n📞 <b>Telefon:</b> ${matched.phone}${roleNotice}`;
    return await sendTelegramReply(chatId, replyText, messageId, BOT_MENU_KEYBOARD);
  } else {
    const notFoundText = `❌ <b>Kiritilgan telefon raqami (+${cleanPhone}) bo'yicha tizimda ma'lumot topilmadi.</b>\n\nIltimos, agar raqamingiz boshqa formatda kiritilgan bo'lsa, Familiya va Ismingizni yozib yuboring.`;
    return await sendTelegramReply(chatId, notFoundText, messageId, BOT_MENU_KEYBOARD);
  }
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
      await prisma.user.update({
        where: { id: uMatch.id },
        data: { telegram_id: String(chatId) }
      }).catch(() => {});
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
    await updateBotSession(chatId, {
      student_name: matched.name,
      group_name: matched.group,
      state: 'IDLE'
    });

    const isStudent = matched.role === "O'quvchi";
    let roleNotice = '';
    if (isStudent) {
      roleNotice = `\n\n📌 <b>Hurmatli o'quvchi!</b> Saytga faqat Starssa, Ustoz va Adminlar kira oladi. O'quvchilar saytdan ro'yxatdan o'tmaydi. Barcha uyga vazifalar va e'lonlar guruhingizda berib boriladi.`;
    } else {
      roleNotice = `\n\n🔐 <b>Siz tizim mas'ulisiz:</b> Saytga kirish uchun quyidagi havoladan foydalaning:\n👉 https://e-starssauz.netlify.app/login`;
    }

    const replyText = `✅ <b>Sizning ma'lumotlaringiz:</b>\n\n👤 <b>F.I.SH:</b> ${matched.name}\n👥 <b>Guruhi:</b> <b>${matched.group}</b>\n🎓 <b>Roli:</b> <b>${matched.role}</b>\n📞 <b>Telefon:</b> ${matched.phone || 'Kiritilmagan'}${roleNotice}`;
    await sendTelegramReply(chatId, replyText, messageId, BOT_MENU_KEYBOARD);
  } else if (cleanPhone.length >= 7 || qName.length >= 3) {
    const notFoundText = `❌ <b>Kiritilgan ma'lumot bo'yicha tizimda ma'lumot topilmadi.</b>\n\nIltimos, Familiya va Ismingizni yoki telefon raqamingizni to'g'ri yozganingizni tekshirib qaytadan yuboring:`;
    await sendTelegramReply(chatId, notFoundText, messageId, BOT_MENU_KEYBOARD);
  }
}

export async function POST(req: Request) {
  try {
    const update = await req.json();

    const message = update.message || update.edited_message;
    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat?.id;
    const isPrivate = message.chat?.type === 'private';
    const text = (message.text || '').trim();
    const lowerText = text.toLowerCase();
    const contact = message.contact;
    const photo = message.photo;
    const caption = (message.caption || '').trim();

    // 0. Guruhda spam, reklama va begona kanallarni tozalash (Anti-Spam)
    if (!isPrivate) {
      const fullText = (text + ' ' + caption).toLowerCase();
      const isSpam =
        fullText.includes('anonymouspumptrades') ||
        (fullText.includes('pump') && fullText.includes('trade')) ||
        fullText.includes('to use this bot, you must join') ||
        fullText.includes('1xbet') ||
        fullText.includes('kazino') ||
        fullText.includes('casino') ||
        (fullText.includes('t.me/') && !fullText.includes('estarssabot'));

      if (isSpam) {
        await deleteTelegramMessage(chatId, message.message_id);
        const sender = message.from?.username 
          ? `@${message.from.username}` 
          : `${message.from?.first_name || "Foydalanuvchi"}`;
        const warn = `⚠️ <b>${sender}</b>, ushbu guruhda reklama, begona botlar va noo'rin havolalar yuborish taqiqlangan!\n\n<i>Xabar o'chirildi.</i>`;
        await sendTelegramReply(chatId, warn);
        return NextResponse.json({ ok: true });
      }
    }


    // 1. Shaxsiy chatda telefon raqam jo'natilganda (request_contact)
    if (isPrivate && contact) {
      await handleContact(chatId, contact, message.message_id);
      return NextResponse.json({ ok: true });
    }

    if (isPrivate) {
      const session = await getBotSession(chatId);

      // Cancel check
      if (
        lowerText === '/cancel' || 
        lowerText === '❌ bekor qilish' || 
        lowerText === '❌ bekor qilish (/cancel)' || 
        lowerText === 'bekor qilish'
      ) {
        await updateBotSession(chatId, { state: 'IDLE' });
        await sendTelegramReply(chatId, "❌ Jarayon bekor qilindi.", message.message_id, BOT_MENU_KEYBOARD);
        return NextResponse.json({ ok: true });
      }

      // 2. /start buyrug'i
      if (lowerText === '/start' || lowerText.startsWith('/start ') || lowerText.startsWith('/start@')) {
        await updateBotSession(chatId, { state: 'IDLE' });
        const welcomeText = `🌟 <b>Assalomu alaykum! E-STARSSA tizimiga xush kelibsiz!</b>\n\n` +
          `ℹ️ <b>Muhim eslatma:</b> Saytga faqat Starssa (guruh sardori), Ustoz va Adminlar kira oladi. O'quvchilar saytdan ro'yxatdan o'tmaydi.\n\n` +
          `👇 <b>Quyidagi tugmalardan foydalanishingiz mumkin:</b>\n` +
          `📱 <b>Telefon raqamni yuborish</b> — guruh va rolingizni bir zumda bilish\n` +
          `✍️ <b>Uyga vazifani o'zi kiritish</b> — yangi vazifa kiritish (ismingiz ko'rsatiladi)\n` +
          `🕵️ <b>Starssaga anonim xabar</b> — sardorga anonim murojaat qilish (javob sayt orqali beriladi)\n\n` +
          `<i>Shuningdek, F.I.SH yoki telefoningizni to'g'ridan-to'g'ri yozib yuborishingiz ham mumkin!</i>`;
        await sendTelegramReply(chatId, welcomeText, message.message_id, BOT_MENU_KEYBOARD);
        return NextResponse.json({ ok: true });
      }

      // 3. "✍️ Uyga vazifa kiritish" tugmasi yoki buyrug'i
      if (
        lowerText === '✍️ uyga vazifani o\'zi kiritish' ||
        lowerText === '✍️ uyga vazifa kiritish' ||
        lowerText === 'uyga vazifa kiritish' ||
        lowerText === '/add_hw' ||
        lowerText === '/new_hw'
      ) {
        await updateBotSession(chatId, { state: 'WAITING_HOMEWORK' });
        const prompt = `✍️ <b>Uyga vazifa kiritish</b>\n\n` +
          `Iltimos, vazifa matnini yuboring.\n\n` +
          `<b>Format namunasi:</b>\n` +
          `Fan: [Fan nomi]\n` +
          `Vazifa: [Uyga vazifa tafsiloti]\n\n` +
          `<i>(Agar daftardagi vazifa rasmi bo'lsa, rasmni izohi (caption) bilan birga yuborishingiz mumkin)</i>\n\n` +
          `<i>Bekor qilish: /cancel</i>`;
        await sendTelegramReply(chatId, prompt, message.message_id, CANCEL_KEYBOARD);
        return NextResponse.json({ ok: true });
      }

      // 4. "🕵️ Starssaga anonim xabar" tugmasi yoki buyrug'i
      if (
        lowerText === '🕵️ starssaga anonim xabar yuborish' ||
        lowerText === '🕵️ starssaga anonim xabar' ||
        lowerText === 'starssaga anonim xabar' ||
        lowerText === '/anonim' ||
        lowerText === '/anonymous'
      ) {
        await updateBotSession(chatId, { state: 'WAITING_ANON_MSG' });
        const prompt = `🕵️ <b>Starssaga anonim xabar yuborish</b>\n\n` +
          `Guruh sardoriga (Starssa) yetkazmoqchi bo'lgan taklif, savol yoki murojaatingizni yozib yuboring.\n\n` +
          `🔒 <b>Maxfiylik kafolatlangan:</b> Sizning shaxsingiz (ism, familiya, profil) Starssaga mutlaqo ko'rinmaydi. Starssa sayt portali orqali javob yozganda, javob bot orqali sizga yetkaziladi.\n\n` +
          `✍️ Anonim xabaringizni yozing:\n\n` +
          `<i>Bekor qilish: /cancel</i>`;
        await sendTelegramReply(chatId, prompt, message.message_id, CANCEL_KEYBOARD);
        return NextResponse.json({ ok: true });
      }

      // 5. WAITING_ANON_MSG holatida xabar kelganda
      if (session.state === 'WAITING_ANON_MSG' && (text || caption)) {
        const msgContent = text || caption;
        const groupName = session.group_name || '104-guruh';

        await prisma.anonymousMessage.create({
          data: {
            telegram_chat_id: String(chatId),
            sender_name: "Anonim o'quvchi",
            group_name: groupName,
            message: msgContent,
            status: 'PENDING'
          }
        });

        await updateBotSession(chatId, { state: 'IDLE' });

        // Foydalanuvchiga tasdiq
        await sendTelegramReply(
          chatId,
          `✅ <b>Anonim xabaringiz Starssaga yetkazildi!</b>\n\nStarssa sayt portali orqali javob berishi bilanoq, sizga ushbu bot orqali xabar keladi.`,
          message.message_id,
          BOT_MENU_KEYBOARD
        );

        // Starssalarga bildirishnoma (Mohinur va Alisher)
        const starssaAlert = `🔔 <b>YANGI ANONIM XABAR KELDI!</b>\n\n` +
          `👥 Guruh: <b>${groupName}</b>\n\n` +
          `📩 Xabar:\n<i>«${msgContent}»</i>\n\n` +
          `Javob berish uchun Starssa portaliga kiring:\n` +
          `👉 https://e-starssa.netlify.app/starssa/anonymous-messages`;

        const starssaChatIds = ['6820579298', '1973751873'];
        for (const sId of starssaChatIds) {
          await sendTelegramReply(sId, starssaAlert);
        }

        return NextResponse.json({ ok: true });
      }

      // 6. WAITING_HOMEWORK holatida xabar yoki rasm kelganda
      if (session.state === 'WAITING_HOMEWORK' && (text || photo || caption)) {
        const studentName = session.student_name ||
          `${message.from?.first_name || "O'quvchi"} ${message.from?.last_name || ''}`.trim();
        const groupName = session.group_name || '104-guruh';

        const rawContent = text || caption || 'Uyga vazifa biriktirildi';
        let subject = 'Umumiy';
        let content = rawContent;

        const fanMatch = rawContent.match(/fan:\s*([^\n]+)/i);
        const vazifaMatch = rawContent.match(/vazifa:\s*([\s\S]+)/i);

        if (fanMatch) {
          subject = fanMatch[1].trim();
        }
        if (vazifaMatch) {
          content = vazifaMatch[1].trim();
        }

        let photoFileId: string | null = null;
        if (photo && photo.length > 0) {
          photoFileId = photo[photo.length - 1].file_id;
        }

        // Bazaga saqlash
        await prisma.homework.create({
          data: {
            date: new Date(),
            subject: subject,
            content: content,
            group_name: groupName,
            created_by: `${studentName} (O'quvchi)`,
            image_url: photoFileId ? `telegram:${photoFileId}` : null,
            status: 'ACTIVE'
          }
        });

        await updateBotSession(chatId, { state: 'IDLE' });

        // O'quvchilar guruhiga xabar jo'natish
        const groupPostText = `📚 <b>Yangi uyga vazifa kiritildi!</b>\n\n` +
          `📖 Fan: <b>${subject}</b>\n` +
          `📝 Vazifa:\n${content}\n\n` +
          `👤 Kiritdi: <b>${studentName} (O'quvchi)</b>`;

        if (photoFileId) {
          try {
            await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: STUDENT_GROUP_ID,
                photo: photoFileId,
                caption: groupPostText,
                parse_mode: 'HTML'
              })
            });
          } catch (e) {
            await sendTelegramReply(STUDENT_GROUP_ID, groupPostText);
          }
        } else {
          await sendTelegramReply(STUDENT_GROUP_ID, groupPostText);
        }

        const confirmText = `✅ <b>Uyga vazifa muvaffaqiyatli qabul qilindi va guruhga yuborildi!</b>\n\n` +
          `📖 Fan: <b>${subject}</b>\n` +
          `👤 Muallif: <b>${studentName} (O'quvchi)</b>`;
        await sendTelegramReply(chatId, confirmText, message.message_id, BOT_MENU_KEYBOARD);
        return NextResponse.json({ ok: true });
      }
    }

    // /hw, /hw@estarssaBot, /vazifa, /homework
    if (
      lowerText === '/hw' ||
      lowerText.startsWith('/hw ') ||
      lowerText.startsWith('/hw@') ||
      lowerText === '/vazifa' ||
      lowerText === '📚 oxirgi vazifalar (/hw)' ||
      lowerText === 'oxirgi vazifalar'
    ) {
      await sendHomeworkReply(chatId, message.message_id);
    }
    // /help, /help@estarssaBot, /yordam
    else if (
      lowerText === '/help' ||
      lowerText.startsWith('/help ') ||
      lowerText.startsWith('/help@') ||
      lowerText === '/yordam'
    ) {
      await handleHelpCommand(chatId, message.message_id, message.from, message.chat?.title);
    }
    // /start, /start@estarssaBot, /info guruhda yuborilganda
    else if (
      lowerText === '/start' ||
      lowerText.startsWith('/start ') ||
      lowerText.startsWith('/start@') ||
      lowerText === '/info' ||
      lowerText.startsWith('/info@')
    ) {
      await sendTelegramReply(chatId, STARSSA_INFO_TEXT, message.message_id);
    }
    // Shaxsiy chatda ism yoki telefon kiritilsa
    else if (isPrivate && text && !text.startsWith('/')) {
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
    const webhookUrl = searchParams.get('url') || 'https://e-starssa.netlify.app/api/telegram/webhook';
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
