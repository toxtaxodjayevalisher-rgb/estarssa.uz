import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { full_name, phone } = await req.json();

    const cleanPhone = (phone || '').replace(/\D/g, '');
    const phoneSuffix = cleanPhone.length >= 7 ? cleanPhone.slice(-9) : '';
    const qName = (full_name || '').trim().toLowerCase();

    if (!phoneSuffix && qName.length < 2) {
      return NextResponse.json({
        success: false,
        error: "Iltimos, F.I.SH yoki telefon raqamingizni kiriting"
      }, { status: 400 });
    }

    const allUsers = await prisma.user.findMany();
    const allStudents = await prisma.student.findMany();

    let matchedPerson: any = null;

    // 1. Check by phone number first if phone is provided
    if (phoneSuffix) {
      const userMatch = allUsers.find(u => {
        const uPhone = (u.phone || '').replace(/\D/g, '');
        return uPhone.endsWith(phoneSuffix);
      });

      if (userMatch) {
        let roleName = "Foydalanuvchi";
        if (userMatch.role === 'ADMIN') roleName = "Admin (Boshqaruvchi)";
        else if (userMatch.role === 'USTOZ') roleName = "Ustoz (O'qituvchi)";
        else if (userMatch.role === 'STARSSA') roleName = "Starssa (Guruh sardori)";

        matchedPerson = {
          type: 'user',
          full_name: userMatch.full_name,
          group_name: userMatch.assigned_group || 'Barchasi',
          role: roleName,
          phone: userMatch.phone,
          birth_date: userMatch.birth_date,
          status: userMatch.status || 'ACTIVE'
        };
      }

      if (!matchedPerson) {
        const studentMatch = allStudents.find(s => {
          const sPhone = (s.phone || '').replace(/\D/g, '');
          return sPhone.endsWith(phoneSuffix);
        });

        if (studentMatch) {
          const isStarssa = allUsers.some(u =>
            u.role === 'STARSSA' && (
              u.full_name.toLowerCase().includes(studentMatch.full_name.toLowerCase()) ||
              studentMatch.full_name.toLowerCase().includes(u.full_name.toLowerCase())
            )
          );

          matchedPerson = {
            type: 'student',
            full_name: studentMatch.full_name,
            group_name: studentMatch.group_name,
            role: isStarssa ? "Starssa (Guruh sardori)" : "O'quvchi",
            phone: studentMatch.phone,
            birth_date: studentMatch.birth_date,
            status: studentMatch.status || 'ACTIVE'
          };
        }
      }
    }

    // 2. Check by Name if not matched by phone
    if (!matchedPerson && qName) {
      const userMatch = allUsers.find(u =>
        u.full_name.toLowerCase().includes(qName) || qName.includes(u.full_name.toLowerCase())
      );

      if (userMatch) {
        let roleName = "Foydalanuvchi";
        if (userMatch.role === 'ADMIN') roleName = "Admin (Boshqaruvchi)";
        else if (userMatch.role === 'USTOZ') roleName = "Ustoz (O'qituvchi)";
        else if (userMatch.role === 'STARSSA') roleName = "Starssa (Guruh sardori)";

        matchedPerson = {
          type: 'user',
          full_name: userMatch.full_name,
          group_name: userMatch.assigned_group || 'Barchasi',
          role: roleName,
          phone: userMatch.phone,
          birth_date: userMatch.birth_date,
          status: userMatch.status || 'ACTIVE'
        };
      }

      if (!matchedPerson) {
        const studentMatch = allStudents.find(s =>
          s.full_name.toLowerCase().includes(qName) || qName.includes(s.full_name.toLowerCase())
        );

        if (studentMatch) {
          const isStarssa = allUsers.some(u =>
            u.role === 'STARSSA' && (
              u.full_name.toLowerCase().includes(studentMatch.full_name.toLowerCase()) ||
              studentMatch.full_name.toLowerCase().includes(u.full_name.toLowerCase())
            )
          );

          matchedPerson = {
            type: 'student',
            full_name: studentMatch.full_name,
            group_name: studentMatch.group_name,
            role: isStarssa ? "Starssa (Guruh sardori)" : "O'quvchi",
            phone: studentMatch.phone,
            birth_date: studentMatch.birth_date,
            status: studentMatch.status || 'ACTIVE'
          };
        }
      }
    }

    if (!matchedPerson) {
      return NextResponse.json({
        success: false,
        error: "Kiritilgan ma'lumotlar bo'yicha o'quvchi yoki xodim topilmadi. F.I.SH yoki telefon raqamingizni tekshirib, qaytadan urinib ko'ring."
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      person: matchedPerson
    });
  } catch (error: any) {
    console.error("Identify error:", error);
    return NextResponse.json({ error: "Server xatosi: " + error.message }, { status: 500 });
  }
}
