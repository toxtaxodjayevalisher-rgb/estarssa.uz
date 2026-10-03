const fs = require('fs');

let code = fs.readFileSync('app/api/attendance/route.ts', 'utf8');

const regex = /if \(submit\) \{[\s\S]*?await sendTelegramMessage\([\s\S]*?\);[\s\S]*?\}/;

const replacement = `
    if (submit) {
      // Guruhdagi umumiy studentlarni sanash (chunki record_id = student_id emas, student nomlarini API dan ololmaymiz to'g'ridan-to'g'ri, lekn bizda records array bor)
      const totalStudents = records.length;
      const presentOrLate = records.filter(r => r.status === 'KELDI' || r.status === 'KECHIKIB_KELDI').length;
      const percent = totalStudents > 0 ? Math.round((presentOrLate / totalStudents) * 100) : 0;
      
      const absentees = records.filter(r => r.status === 'KELMADI');
      const lates = records.filter(r => r.status === 'KECHIKIB_KELDI');

      // Note: records da student_name yo'q, faqat id bor. Biz DB dan tortamiz.
      const studentIds = records.map(r => r.student_id);
      const dbStudents = await prisma.student.findMany({ where: { id: { in: studentIds } }, include: { attendances: true } });
      const studentMap = {};
      dbStudents.forEach(s => studentMap[s.id] = s);

      const absenteesText = absentees.length > 0 ? absentees.map(r => \`- \${studentMap[r.student_id]?.full_name}: \${r.note || 'Sababsiz'}\`).join('\\n') : "Yo'q";
      const latesText = lates.length > 0 ? lates.map(r => \`- \${studentMap[r.student_id]?.full_name}: \${r.note || 'Soat kiritilmagan'}\`).join('\\n') : "Yo'q";

      const dateStr = new Date(date).toLocaleDateString();

      // Qoidabuzarlar (oxirgi 1 oyda 3 martadan ko'p xato qilganlar DB dan keladi)
      const qoidabuzarlar = dbStudents.filter(s => {
        const h = s.attendances.filter(a => a.status === 'KELMADI' || a.status === 'KECHIKIB_KELDI').length;
        // Agar bu safargi record bilan 3 tadan oshsa... (hozirgisi ham qo'shiladi)
        return h >= 2; // shartli ravishda oldin 2 ta bo'lgan bo'lsa hozirgisi b.n 3 ta
      });
      let qoidabuzarText = '';
      if(qoidabuzarlar.length > 0) {
        qoidabuzarText = '\\n\\nKimlar nechchi marotaba qoidalarni buzmoqda:\\n' + qoidabuzarlar.map(s => \`- \${s.full_name}\`).join('\\n');
      }

      // 1. Guruhga xabar (-5459131960)
      const groupMsg = \`Assalomu aleykum\\n\${dateStr}\\n\${group_name}\\nDavomat (\${percent}%)\\nKelmaganlar (\${absentees.length} ta):\\n\${absenteesText}\`;

      // 2. Ustozga xabar (1973751873)
      const ustozMsg = \`Assalomu aleykum ustoz\\n\${dateStr}\\n\${group_name}\\nDavomat (\${percent}%)\\nKelmaganlar (\${absentees.length} ta):\\n\${absenteesText}\\n\\nKechikib kelgan:\\n\${latesText}\${qoidabuzarText}\`;

      try {
        const token = process.env.TELEGRAM_BOT_TOKEN || '8983797302:AAHrMF0yZQ0qOgRGgE96SL6nV5hMKPdD_p4';
        
        await globalThis.fetch(\`https://api.telegram.org/bot\${token}/sendMessage\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: '-5459131960', text: groupMsg })
        });
        
        await globalThis.fetch(\`https://api.telegram.org/bot\${token}/sendMessage\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: '1973751873', text: ustozMsg })
        });
      } catch(e) { console.error(e); }
    }
`;

if(regex.test(code)) {
  code = code.replace(regex, replacement.trim());
  fs.writeFileSync('app/api/attendance/route.ts', code);
}
