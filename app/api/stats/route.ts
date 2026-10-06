import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = verifyAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    // Get total students
    let studentsQuery: any = { status: 'ACTIVE' };
    if (user.role === 'USTOZ' || user.role === 'STARSSA') {
      studentsQuery.group_name = user.assigned_group || 'Hech qaysi';
    }
    const totalStudents = await prisma.student.count({ where: studentsQuery });

    // Get last 7 days attendance stats
    let attendanceQuery: any = {
      date: { gte: sevenDaysAgo }
    };
    if (user.role === 'USTOZ' || user.role === 'STARSSA') {
      attendanceQuery.session = { group_name: user.assigned_group || 'Hech qaysi' };
    }

    const recentAttendances = await prisma.attendance.findMany({
      where: attendanceQuery,
      include: { session: true }
    });

    // Process for chart (group by day)
    const daysMap: Record<string, { keldi: number, kelmadi: number, sababli: number }> = {};
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      daysMap[dateStr] = { keldi: 0, kelmadi: 0, sababli: 0 };
    }

    // Process group rankings
    const groupsMap: Record<string, { total: number, keldi: number }> = {};

    recentAttendances.forEach(att => {
      const dateStr = new Date(att.date).toISOString().split('T')[0];
      if (daysMap[dateStr]) {
        if (att.status === 'Keldi') daysMap[dateStr].keldi++;
        else if (att.status === 'Kelmadi') daysMap[dateStr].kelmadi++;
        else if (att.status === 'Sababli') daysMap[dateStr].sababli++;
      }

      const gName = att.session.group_name;
      if (!groupsMap[gName]) groupsMap[gName] = { total: 0, keldi: 0 };
      groupsMap[gName].total++;
      if (att.status === 'Keldi') groupsMap[gName].keldi++;
    });

    const chartData = Object.keys(daysMap).sort().map(date => ({
      date: date.substring(5), // MM-DD
      Keldi: daysMap[date].keldi,
      Kelmadi: daysMap[date].kelmadi,
      Sababli: daysMap[date].sababli
    }));

    const groupRankings = Object.keys(groupsMap).map(name => ({
      name,
      percentage: Math.round((groupsMap[name].keldi / groupsMap[name].total) * 100) || 0
    })).sort((a, b) => b.percentage - a.percentage);

    return NextResponse.json({
      totalStudents,
      chartData,
      groupRankings,
    });
  } catch (error) {
    console.error("Stats Error:", error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
