import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth((await cookies()).get('token')?.value);
    if (!auth || auth.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const users = await prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      select: { id: true, username: true, role: true, full_name: true, status: true, created_at: true }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth((await cookies()).get('token')?.value);
    if (!auth || auth.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { username, password, role, full_name } = await req.json();
    if (!username || !password || !role || !full_name) {
      return NextResponse.json({ error: 'Barcha maydonlarni to`ldiring' }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { username, password_hash, role, full_name },
      select: { id: true, username: true, role: true, full_name: true, status: true }
    });
    return NextResponse.json(user);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Bu login (username) allaqachon mavjud' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
