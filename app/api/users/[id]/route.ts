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

    const { username, password, role, full_name, status } = await req.json();
    const { id } = await params;
    
    let updateData: any = { username, role, full_name, status };
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, username: true, role: true, full_name: true, status: true }
    });
    return NextResponse.json(user);
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Bu login (username) mavjud' }, { status: 400 });
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth((await cookies()).get('token')?.value);
    if (!auth || auth.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    // Don't allow admin to delete themselves
    if (id === auth.userId) return NextResponse.json({ error: 'O`z akkauntingizni o`chira olmaysiz' }, { status: 400 });

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Foydalanuvchiga bog`langan ma`lumotlar (davomat/vazifalar) bo`lishi mumkin' }, { status: 400 });
  }
}
