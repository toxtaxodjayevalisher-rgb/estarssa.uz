import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET() {
  try {
    const groups = await prisma.group.findMany({ orderBy: { created_at: 'desc' } });
    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: 'Nomi kiritilishi shart' }, { status: 400 });
    const group = await prisma.group.create({ data: { name } });
    return NextResponse.json(group);
  } catch (error) {
    return NextResponse.json({ error: 'Xatolik (balki bu guruh mavjud)' }, { status: 500 });
  }
}
