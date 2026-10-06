import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const auth = await verifyAuth((await cookies()).get('token')?.value);
    if (!auth || auth.role !== 'ADMIN') return NextResponse.json({ error: 'Ruxsat etilmagan' }, { status: 403 });

    const sessions = await prisma.attendanceSession.findMany({
      orderBy: { date: 'desc' },
      include: {
        records: { include: { student: true } },
        created_by: { select: { full_name: true } }
      }
    });
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Bayram kunini yaratish
  try {
    const auth = await verifyAuth((await cookies()).get('token')?.value);
    if (!auth || auth.role !== 'ADMIN') return NextResponse.json({ error: 'Ruxsat etilmagan' }, { status: 403 });

    const { date, group_name } = await req.json();
    if (!date || !group_name) return NextResponse.json({ error: 'Sana va guruh kerak' }, { status: 400 });

    const existing = await prisma.attendanceSession.findUnique({
      where: { date_group_name: { date: new Date(date), group_name } }
    });

    if (existing) {
      // Mavjud bo'lsa uni bayramga o'zgartirish
      await prisma.attendanceSession.update({
        where: { id: existing.id },
        data: { status: 'HOLIDAY' }
      });
    } else {
      await prisma.attendanceSession.create({
        data: {
          date: new Date(date),
          group_name,
          status: 'HOLIDAY',
          created_by_id: auth.id
        }
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
