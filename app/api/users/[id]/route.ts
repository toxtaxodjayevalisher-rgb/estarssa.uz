import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth((await cookies()).get('token')?.value);
    if (!auth || auth.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { username, password, role, full_name, status, phone, birth_date, assigned_group } = await req.json();
    const { id } = await params;
    
    // Check limit for Starssa if group changed or set
    if (role === 'STARSSA' && assigned_group) {
      const existingStarssas = await prisma.user.count({
        where: { role: 'STARSSA', assigned_group, id: { not: id } }
      });
      if (existingStarssas >= 2) {
        return NextResponse.json({ error: 'Bitta guruhda uzog`i 2 ta Starssa bo`lishi mumkin!' }, { status: 400 });
      }
    }

    let updateData: any = { 
      username, 
      role, 
      full_name, 
      status,
      phone: phone || null,
      birth_date: birth_date ? new Date(birth_date) : null,
      assigned_group: assigned_group || null
    };
    if (password && password.trim() !== '') {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, username: true, role: true, full_name: true, status: true, phone: true, birth_date: true, assigned_group: true }
    });
    return NextResponse.json(user);
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Bu login (username) allaqachon mavjud' }, { status: 400 });
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth((await cookies()).get('token')?.value);
    if (!auth || auth.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (id === auth.id || id === auth.userId) return NextResponse.json({ error: 'O`z akkauntingizni o`chira olmaysiz' }, { status: 400 });

    // Bog'langan yozuvlarni xavfsiz tozalash/qayta biriktirish
    await prisma.notificationLog.deleteMany({ where: { recipient_id: id } });
    await prisma.telegramMessage.deleteMany({ where: { OR: [{ sender_id: id }, { recipient_id: id }] } });
    await prisma.attendanceSession.updateMany({ where: { approved_by_id: id }, data: { approved_by_id: null } });
    await prisma.attendanceSession.updateMany({ where: { created_by_id: id }, data: { created_by_id: auth.id } });

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Foydalanuvchini o`chirishda xatolik yuz berdi' }, { status: 500 });
  }
}
