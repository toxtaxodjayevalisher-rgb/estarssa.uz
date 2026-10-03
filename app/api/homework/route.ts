import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { sendTelegramMessage, sendTelegramPhoto } from '@/lib/telegram';

export async function GET(req: Request) {
  const auth = await verifyAuth();
  if (!auth) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'ACTIVE';

  try {
    const homework = await prisma.homework.findMany({
      where: { status },
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(homework);
  } catch (error) {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.role.toUpperCase() !== 'STARSSA') {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const dateStr = formData.get('date') as string;
    const group_name = formData.get('group_name') as string;
    const tasksStr = formData.get('tasks') as string;
    const image = formData.get('image') as File | null;
    
    if (!dateStr || !group_name || !tasksStr) {
      return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
    }

    let tasks = [];
    try {
      tasks = JSON.parse(tasksStr);
    } catch(e) {
      return NextResponse.json({ error: "Xato ma'lumot formati" }, { status: 400 });
    }

    let image_url = null;
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      const mimeType = image.type || 'image/jpeg';
      image_url = `data:${mimeType};base64,${base64}`;
    }

    const d = new Date(dateStr);
    const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
    const hwDate = `${days[d.getDay()]} (${d.getDate()}-${months[d.getMonth()]})`;

    for (const t of tasks) {
      if (!t.subject || !t.content) {
         return NextResponse.json({ error: "Fan nomi va vazifani to'ldiring" }, { status: 400 });
      }
      await prisma.homework.create({
        data: {
          date: new Date(dateStr),
          subject: t.subject,
          content: t.content,
          group_name,
          image_url,
          created_by: auth.username,
          status: 'ACTIVE'
        }
      });
    }

    let tgMsg = `📚 <b>Yangi uyga vazifa!</b>\n\n📅 Sana: ${hwDate}\n👥 Guruh: ${group_name}\n`;
    for (const t of tasks) {
      tgMsg += `\n📖 Fan: <b>${t.subject}</b>\n📝 Vazifa:\n${t.content}\n`;
    }
    tgMsg += `\n👤 Kiritdi: ${auth.username}`;

    if (image) {
      await sendTelegramPhoto(tgMsg, image);
    } else {
      await sendTelegramMessage(tgMsg);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Homework error:", error);
    return NextResponse.json({ error: "Server xatosi: " + error.message }, { status: 500 });
  }
}
