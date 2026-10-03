import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { sendTelegramMessage } from '@/lib/telegram';
import fs from 'fs';
import path from 'path';

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
    const subject = formData.get('subject') as string;
    const content = formData.get('content') as string;
    const group_name = formData.get('group_name') as string;
    const image = formData.get('image') as File | null;
    
    if (!dateStr || !subject || !content || !group_name) {
      return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
    }

    let image_url = null;
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = Date.now() + '-' + image.name;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      image_url = '/uploads/' + filename;
    }

    const homework = await prisma.homework.create({
      data: {
        date: new Date(dateStr),
        subject,
        content,
        group_name,
        image_url,
        created_by: auth.username,
        status: 'ACTIVE'
      }
    });

    const hwDate = new Date(dateStr).toLocaleDateString();
    let msg = `📚 <b>Yangi uyga vazifa!</b>\n\n📅 Sana: ${hwDate}\n👥 Guruh: ${group_name}\n\n📝 Vazifa:\n${content}\n\n👤 Kiritdi: ${auth.username}`;
    
    // Yuborish (rasm bo'lsa uni alohida URL orqali botdan yuborish mumkin edi, lekin hozircha bot token fayl orqali rasm yuborishni fetch da qiyinroq qiladi, shuning uchun tekst yuboramiz)
    await sendTelegramMessage(msg);

    return NextResponse.json({ success: true, homework });
  } catch (error: any) {
    console.error("Homework error:", error);
    return NextResponse.json({ error: "Server xatosi: " + error.message }, { status: 500 });
  }
}
