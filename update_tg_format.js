const fs = require('fs');

let code = fs.readFileSync('app/api/attendance/route.ts', 'utf8');

const regex = /if \(submit\) \{[\s\S]*?try \{[\s\S]*?globalThis\.fetch[\s\S]*?\} catch\(e\) \{ console\.error\(e\); \}\s*\}/;

const replacement = `
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
        const list = absentees.map(r => \`- \${studentMap[r.student_id]?.full_name}: \${r.note || 'Sababsiz'}\`).join('\\n');
        absenteesBlock = \`\\nKelmaganlar: \${absentees.length} ta\\nSababi:\\n\${list}\`;
      }

      // Kech qolganlar bloki (faqat ustoz uchun)
      let latesBlock = '';
      if (lates.length > 0) {
        const list = lates.map(r => \`- \${studentMap[r.student_id]?.full_name}: \${r.note || 'Soati kiritilmagan'}\`).join('\\n');
        latesBlock = \`\\nKech qolgan o'quvchilar: \${lates.length} ta\\nVaqti:\\n\${list}\`;
      }

      // Qoidabuzarlar (faqat ustoz uchun)
      const qoidabuzarlar = dbStudents.filter(s => {
        const h = s.attendances.filter(a => a.status === 'KELMADI' || a.status === 'KECHIKIB_KELDI').length;
        return h >= 2;
      });
      let qoidabuzarText = '';
      if(qoidabuzarlar.length > 0) {
        qoidabuzarText = '\\n\\nKimlar nechchi marotaba qoidalarni buzmoqda:\\n' + qoidabuzarlar.map(s => \`- \${s.full_name}\`).join('\\n');
      }

      const groupMsg = \`Assalomu aleykum\\n\${dateStr}\\n\${group_name}\\nDavomat: \${percent}%\${absenteesBlock}\`;
      const ustozMsg = \`Assalomu aleykum ustoz\\n\${dateStr}\\n\${group_name}\\nDavomat: \${percent}%\${absenteesBlock}\\n\${latesBlock}\${qoidabuzarText}\`;

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
