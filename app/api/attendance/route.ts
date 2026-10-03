import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { sendTelegramMessage } from '@/lib/telegram';

export async function GET(req: Request) {
  const auth = await verifyAuth();
  if (!auth) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  
  const { searchParams } = new URL(req.url);
  const group = searchParams.get('group');
  
  try {
    const where = group ? { group_name: group } : {};
    const students = await prisma.student.findMany({ where, orderBy: { full_name: 'asc' } });
    return NextResponse.json(students);
  } catch(e) {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await verifyAuth();
  if (!auth) return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });

  try {
    const data = await req.json(); 

    if (data.action === 'edit_draft') {
      const sessionData = await prisma.attendanceSession.findUnique({
        where: { id: data.session_id },
        include: { created_by: true }
      });
      
      await prisma.attendance.deleteMany({ where: { session_id: data.session_id } });
      await prisma.attendanceSession.update({
        where: { id: data.session_id },
        data: { status: 'DRAFT', submitted_at: null, approved_by_id: null, approved_at: null }
      });
      
      if (sessionData) {
        const msg = `⚠️ <b>DIQQAT! Davomat bekor qilindi!</b>\n\n👤 Bekor qilgan xodim (login): <b>${auth.username}</b>\n\n⏳ 5 daqiqa ichida qayta davomat qilishi lozim!`;
          await sendTelegramMessage(msg);
      }
      
      return NextResponse.json({ success: true });
    }

    const { date, group_name, records, submit } = data;

    const sessionDate = new Date(date);
    sessionDate.setHours(0, 0, 0, 0);

    let session = await prisma.attendanceSession.findFirst({
      where: { date: sessionDate, group_name }
    });

    if (!session) {
      session = await prisma.attendanceSession.create({
        data: {
          date: sessionDate,
          group_name,
          created_by_id: auth.id,
          status: submit ? 'SENT_FOR_APPROVAL' : 'DRAFT',
          submitted_at: submit ? new Date() : null
        }
      });
    } else {
      session = await prisma.attendanceSession.update({
        where: { id: session.id },
        data: { 
          status: submit ? 'SENT_FOR_APPROVAL' : 'DRAFT',
          submitted_at: submit ? new Date() : session.submitted_at
        }
      });
      await prisma.attendance.deleteMany({ where: { session_id: session.id } });
    }

    const attendanceData = records.map((r: any) => ({
      student_id: r.student_id,
      session_id: session!.id,
      date: new Date(date),
      status: r.status,
      note: r.note || null
    }));

    await prisma.attendance.createMany({ data: attendanceData });

    if (submit) {
      const totalStudents = records.length;
      const presentOrLate = records.filter(r => r.status === 'KELDI' || r.status === 'KECHIKIB_KELDI').length;
      const percent = totalStudents > 0 ? Math.round((presentOrLate / totalStudents) * 100) : 0;
      
      const absentees = records.filter(r => r.status === 'KELMADI');
      const lates = records.filter(r => r.status === 'KECHIKIB_KELDI');

      const studentIds = records.map(r => r.student_id);
      const dbStudents = await prisma.student.findMany({ where: { id: { in: studentIds } }, include: { attendances: true } });
      const studentMap = {};
      dbStudents.forEach(s => studentMap[s.id] = s);

      const dateStr = new Date(date).toLocaleDateString();

      // Kelmaganlar bloki
      let absenteesBlock = '';
      if (absentees.length > 0) {
        const list = absentees.map(r => `- ${studentMap[r.student_id]?.full_name}: ${r.note || 'Sababsiz'}`).join('\n');
        absenteesBlock = `\nKelmaganlar: ${absentees.length} ta\nSababi:\n${list}`;
      }

      // Kech qolganlar bloki (faqat ustoz uchun)
      let latesBlock = '';
      if (lates.length > 0) {
        const list = lates.map(r => `- ${studentMap[r.student_id]?.full_name}: ${r.note || 'Soati kiritilmagan'}`).join('\n');
        latesBlock = `\nKech qolgan o'quvchilar: ${lates.length} ta\nVaqti:\n${list}`;
      }

      // Qoidabuzarlar (faqat ustoz uchun)
      const qoidabuzarlar = dbStudents.filter(s => {
        const h = s.attendances.filter(a => a.status === 'KELMADI' || a.status === 'KECHIKIB_KELDI').length;
        return h >= 2;
      });
      let qoidabuzarText = '';
      if(qoidabuzarlar.length > 0) {
        qoidabuzarText = '\n\nKimlar nechchi marotaba qoidalarni buzmoqda:\n' + qoidabuzarlar.map(s => `- ${s.full_name}`).join('\n');
      }

      const groupMsg = `Assalomu aleykum\n${dateStr}\n${group_name}\nDavomat: ${percent}%${absenteesBlock}`;
      const ustozMsg = `Assalomu aleykum ustoz\n${dateStr}\n${group_name}\nDavomat: ${percent}%${absenteesBlock}\n${latesBlock}${qoidabuzarText}`;

      try {
        const token = process.env.TELEGRAM_BOT_TOKEN || '8983797302:AAHrMF0yZQ0qOgRGgE96SL6nV5hMKPdD_p4';
        await globalThis.fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: '-5459131960', text: groupMsg })
        });
        
        await globalThis.fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: '-5459131960', text: ustozMsg })
        });
      } catch(e) { console.error(e); }
    }

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
