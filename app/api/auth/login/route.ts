import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    const user = await prisma.user.findUnique({ where: { username } });
    
    if (!user) return NextResponse.json({ error: 'Login yoki parol noto\'g\'ri' }, { status: 401 });
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return NextResponse.json({ error: 'Login yoki parol noto\'g\'ri' }, { status: 401 });
    
    const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
    
    const cookieStore = await cookies();
    cookieStore.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
    
    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
