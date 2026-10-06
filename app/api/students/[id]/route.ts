import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { full_name, group_name, phone, birth_date } = await req.json();
    const { id } = await params;
    const student = await prisma.student.update({
      where: { id },
      data: {
        full_name,
        group_name,
        phone,
        birth_date: birth_date ? new Date(birth_date) : null
      }
    });
    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    await prisma.student.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 });
  }
}
