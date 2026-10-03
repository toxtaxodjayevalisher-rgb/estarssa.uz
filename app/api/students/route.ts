import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: Request) {
  const auth = await verifyAuth();
  if (!auth) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  try {
    const students = await prisma.student.findMany({
      orderBy: { full_name: 'asc' },
      include: {
        attendances: true
      }
    });
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await verifyAuth();
  if (!auth || (auth.role.toUpperCase() !== 'ADMIN' && auth.role.toUpperCase() !== 'STARSSA')) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  try {
    const { full_name, group_name, phone, birth_date } = await req.json();
    if (!full_name || !group_name) return NextResponse.json({ error: "To'liq ma'lumot kiriting" }, { status: 400 });

    const student = await prisma.student.create({
      data: {
        full_name,
        group_name,
        phone: phone || null,
        birth_date: birth_date ? new Date(birth_date) : null
      },
      include: { attendances: true }
    });
    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await verifyAuth();
  if (!auth || (auth.role.toUpperCase() !== 'ADMIN' && auth.role.toUpperCase() !== 'STARSSA')) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  try {
    const { id, full_name, group_name, phone, birth_date } = await req.json();
    
    const student = await prisma.student.update({
      where: { id },
      data: {
        full_name,
        group_name,
        phone: phone || null,
        birth_date: birth_date ? new Date(birth_date) : null
      },
      include: { attendances: true }
    });
    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
