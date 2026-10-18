import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram';

const CHAT_ADMIN = '-5459131960';
const CHAT_STUDENTS = '-1004395732727';

function getTashkentTime() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tashkent',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  const parts = formatter.formatToParts(now);
  const map: Record<string, string> = {};
  parts.forEach(p => { map[p.type] = p.value; });

  const year = parseInt(map.year, 10);
  const month = parseInt(map.month, 10);
  const day = parseInt(map.day, 10);
  const hour = parseInt(map.hour, 10);
  const minute = parseInt(map.minute, 10);

  const startUtc = new Date(`${map.year}-${map.month}-${map.day}T00:00:00+05:00`);
  const endUtc = new Date(`${map.year}-${map.month}-${map.day}T23:59:59.999+05:00`);

  return { year, month, day, hour, minute, startUtc, endUtc };
}

const REMINDERS = {
  morning_attendance: {
    type: 'REMINDER_MORNING_ATTENDANCE',
    chatId: CHAT_ADMIN,
    getText: () => `🔔 <b>Davomat eslatmasi!</b>\n\nAssalomu alaykum!\nBugungi guruh davomati qilindimi?\n\nIltimos, o'quvchilar davomatini o'z vaqtida belgilab, ustozga tasdiqlash uchun yuboring!\n\n👉 https://e-starssa.netlify.app/starssa/attendance`
  },
  students_discipline: {
    type: 'REMINDER_STUDENTS_DISCIPLINE',
    chatId: CHAT_STUDENTS,
    getText: () => `⚠️ <b>DIQQAT, HURMATLI O'QUVCHILAR!</b>\n\nEslatib o'tamiz, tartib-intizom qoidalariga qat'iy rioya qiling:\n\n1️⃣ <b>Vaqtliroq kelish:</b> Darslarga kechikmasdan, o'z vaqtida (vaqtliroq) yetib keling!\n2️⃣ <b>Telefonlarni topshirish:</b> Dars boshlanishidan oldin barcha telefonlarni belgilangan joyga topshiring!\n3️⃣ <b>Kurator xonasiga borish:</b> Darslar yakunlangach, barchangiz kurator xonasiga uchrashing!\n\n<i>O'quv intizomiga qat'iy rioya qilishingizni so'raymiz!</i>`
  },
  afternoon_approval: {
    type: 'REMINDER_AFTERNOON_APPROVAL',
    chatId: CHAT_ADMIN,
    getText: () => `📋 <b>Davomat tasdiqlandimi?</b>\n\nAssalomu alaykum!\nBugungi kiritilgan guruh davomati tasdiqlandimi?\n\nHurmatli ustoz va mas'ullardan davomat holatini tekshirib, tasdiqlab qo'yishlarini so'raymiz!\n\n👉 https://e-starssa.netlify.app/ustoz/approve`
  }
};

async function executeReminder(
  key: 'morning_attendance' | 'students_discipline' | 'afternoon_approval',
  force: boolean,
  startUtc: Date,
  endUtc: Date
) {
  const conf = REMINDERS[key];
  if (!conf) return { error: `Noma'lum eslatma turi: ${key}` };

  if (!force) {
    const existing = await prisma.telegramMessage.findFirst({
      where: {
        message_type: conf.type,
        sent_at: { gte: startUtc, lte: endUtc }
      }
    });

    if (existing) {
      return { success: true, skipped: true, message: `${conf.type} bugun allaqachon yuborilgan.` };
    }
  }

  const text = conf.getText();
  const msgIds = await sendTelegramMessage(text, [conf.chatId]);

  await prisma.telegramMessage.create({
    data: {
      telegram_id: conf.chatId,
      message: text,
      message_type: conf.type,
      status: 'SENT'
    }
  });

  return { success: true, type: conf.type, chatId: conf.chatId, messageIds: msgIds };
}

async function handleRequest(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'auto';
    const force = searchParams.get('force') === 'true';

    const { hour, minute, startUtc, endUtc } = getTashkentTime();

    if (type === 'auto') {
      const results: any[] = [];
      // 08:35 (window 08:30 - 08:55)
      if (hour === 8 && minute >= 30 && minute <= 55) {
        results.push(await executeReminder('morning_attendance', force, startUtc, endUtc));
      }
      // 11:30 (window 11:25 - 11:50)
      if (hour === 11 && minute >= 25 && minute <= 50) {
        results.push(await executeReminder('students_discipline', force, startUtc, endUtc));
      }
      // 14:00 (window 13:55 - 14:20)
      if ((hour === 13 && minute >= 55) || (hour === 14 && minute <= 20)) {
        results.push(await executeReminder('afternoon_approval', force, startUtc, endUtc));
      }

      if (results.length === 0) {
        return NextResponse.json({
          status: 'idle',
          message: `Hozirgi vaqtda (${hour}:${minute.toString().padStart(2, '0')} Toshkent vaqti) rejalashtirilgan eslatma yo'q.`,
          tashkentTime: `${hour}:${minute.toString().padStart(2, '0')}`
        });
      }

      return NextResponse.json({ success: true, results });
    }

    if (type in REMINDERS) {
      const result = await executeReminder(type as keyof typeof REMINDERS, force, startUtc, endUtc);
      return NextResponse.json(result);
    }

    return NextResponse.json({
      error: `Noto'g'ri eslatma turi: ${type}. Mumkin bo'lgan turlar: morning_attendance, students_discipline, afternoon_approval, auto`
    }, { status: 400 });
  } catch (error: any) {
    console.error('Cron reminder error:', error);
    return NextResponse.json({ error: error.message || 'Server xatosi' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return handleRequest(req);
}

export async function POST(req: Request) {
  return handleRequest(req);
}
