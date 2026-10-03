import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { sendTelegramMessage, sendTelegramPhoto } from '@/lib/telegram';

const prisma = new PrismaClient();

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
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const image = formData.get('image') as File | null;

    if (!title || !content) {
      return NextResponse.json({ error: 'Sarlavha va matn kiritilishi shart' }, { status: 400 });
    }

    let imageUrl = null;
    let caption = `📢 E'LON: ${title}\n\n${content}\n\n✍️ Yuboruvchi: ${auth.role}`;

    // Always send text message or photo to telegram
    if (image && image.size > 0) {
      // Save as base64 for DB
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${image.type};base64,${buffer.toString('base64')}`;
      imageUrl = base64;
      
      // Send to telegram
      try {
        await sendTelegramPhoto(caption, image);
      } catch (e) {
        console.error("Telegram error:", e);
      }
    } else {
      try {
        await sendTelegramMessage(caption);
      } catch (e) {
        console.error("Telegram error:", e);
      }
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        image_url: imageUrl,
        created_by: auth.role, // "Ustoz", "Admin", etc
      }
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
