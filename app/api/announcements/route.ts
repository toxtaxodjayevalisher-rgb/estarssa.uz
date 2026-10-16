import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { sendTelegramMessage, sendTelegramPhoto } from '@/lib/telegram';

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json(announcements);
  } catch (error) {
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const auth = await verifyAuth(token);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const title = (formData.get('title') as string || '').trim();
    const content = (formData.get('content') as string || '').trim();
    const image = formData.get('image') as File | null;

    if (!title || !content) {
      return NextResponse.json({ error: 'Sarlavha va matn kiritilishi shart' }, { status: 400 });
    }

    const senderTitle = auth.role === 'ADMIN' ? 'Administrator' : auth.role === 'USTOZ' ? 'Ustoz' : 'Starssa';
    const senderName = auth.full_name || auth.username || senderTitle;
    const caption = `📢 <b>DIQQAT E'LON: ${title}</b>\n\n${content}\n\n✍️ <i>Yuboruvchi: ${senderName} (${senderTitle})</i>`;

    let imageUrl = null;
    let msgIds: any = [];

    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${image.type};base64,${buffer.toString('base64')}`;
      imageUrl = base64;
      msgIds = await sendTelegramPhoto(caption, image);
    } else {
      msgIds = await sendTelegramMessage(caption);
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        image_url: imageUrl,
        created_by: `${senderName} (${senderTitle})`,
        telegram_msg_ids: JSON.stringify(msgIds)
      }
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
