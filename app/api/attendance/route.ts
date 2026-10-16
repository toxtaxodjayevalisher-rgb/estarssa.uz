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
    const finalGroupName = (group_name && group_name !== 'Barchasi') ? group_name : (auth.assigned_group || 'IG2-26');

    const sessionDate = new Date(date);
    const dayStart = new Date(sessionDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(sessionDate);
    dayEnd.setHours(23, 59, 59, 999);

    let session = await prisma.attendanceSession.findFirst({
      where: { 
        date: { gte: dayStart, lte: dayEnd },
        group_name: finalGroupName
      }
    });

    if (!session) {
      session = await prisma.attendanceSession.create({
        data: {
          date: dayStart,
          group_name: finalGroupName,
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
      const studentIds = records.map((r: any) => r.student_id);
      const dbStudents = await prisma.student.findMany({ where: { id: { in: studentIds } } });
      const studentMap: Record<string, any> = {};
      dbStudents.forEach(s => { studentMap[s.id] = s; });

      // Faqat KELDI bo'lmagan o'quvchilar
      const notPresent = records.filter((r: any) => r.status !== 'KELDI');

      let telegramMessage = '';
      if (notPresent.length === 0) {
        // Hamma kelgan bo'lsa
        telegramMessage = `Assalomu alaykum\n${finalGroupName} 100%`;
      } else {
        // Kimdir kasal, sababsiz yoki kechikkan bo'lsa
        const list = notPresent.map((r: any) => {
          const student = studentMap[r.student_id];
          const name = student?.full_name || "O'quvchi";
          let reason = (r.note || '').trim();
          if (!reason) {
            if (r.status === 'UZR_LI') reason = 'kasal';
            else if (r.status === 'KELMADI') reason = 'sababsiz';
            else if (r.status === 'KECHIKIB_KELDI') reason = 'kechikdi';
          }
          return `${name}(${reason})`;
        }).join('\n');

        telegramMessage = `Assalomu alaykum\n${finalGroupName}\n${list}`;
      }

      try {
        const token = process.env.TELEGRAM_BOT_TOKEN || '8983797302:AAHrMF0yZQ0qOgRGgE96SL6nV5hMKPdD_p4';
        const CHAT_IDS = ['-5459131960', '1973751873'];
        
        for (const chatId of CHAT_IDS) {
          await globalThis.fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: telegramMessage })
          });
        }
      } catch(e) { 
        console.error("Telegram xatosi:", e); 
      }
    }

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
