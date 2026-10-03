const fs = require('fs');

let code = fs.readFileSync('app/api/attendance/route.ts', 'utf8');

// Ensure we have sendTelegramMessage imported
if (!code.includes("import { sendTelegramMessage }")) {
  code = code.replace(
    "import { verifyAuth } from '@/lib/auth';", 
    "import { verifyAuth } from '@/lib/auth';\nimport { sendTelegramMessage } from '@/lib/telegram';"
  );
}

// Update the submission logic
const findSubmitLogic = /if \(submit\) \{[\s\S]*?await prisma\.attendanceSession\.update\(\{[\s\S]*?where: \{ id: session\.id \},[\s\S]*?data: \{ status: 'SENT_FOR_APPROVAL', submitted_at: new Date\(\) \}[\s\S]*?\}\);[\s\S]*?\}/;

const submitLogicReplacement = `
    if (submit) {
      await prisma.attendanceSession.update({
        where: { id: session.id },
        data: { status: 'SENT_FOR_APPROVAL', submitted_at: new Date() }
      });

      // Davomat natijalarini hisoblash
      const totalStudents = records.length;
      const presentOrLate = records.filter((r: any) => r.status === 'KELDI' || r.status === 'KECHIKIB_KELDI').length;
      const percent = totalStudents > 0 ? Math.round((presentOrLate / totalStudents) * 100) : 0;
      
      const absentees = records.filter((r: any) => r.status === 'KELMADI');
      let absenteesText = absentees.length > 0 ? absentees.map((r: any) => \`- \${r.student_name}: \${r.note || 'Sababsiz'}\`).join('\\n') : "Yo'q";

      const lates = records.filter((r: any) => r.status === 'KECHIKIB_KELDI');
      let latesText = lates.length > 0 ? lates.map((r: any) => \`- \${r.student_name}: \${r.note || 'Kiritilmagan'}\`).join('\\n') : "Yo'q";

      const dateStr = sessionDate.toLocaleDateString();

      // Guruhga xabar (-5459131960)
      const groupMsg = \`Assalomu aleykum
\${dateStr}
\${group_name}
Davomat: \${percent}%
Kelmaganlar: \${absentees.length} ta
Sababi:
\${absenteesText}\`;

      // Ustozga xabar (1973751873)
      // Biz "kimlar nechchi marotaba qoidalarni buzmoqda" statistikasi uchun top-violators ni chaqirishimiz yoki faqat ismlarni jo'natishimiz mumkin.
      const ustozMsg = \`Assalomu aleykum ustoz
\${dateStr}
\${group_name}
Davomat: \${percent}%
Kelmaganlar: \${absentees.length} ta
Sababi:
\${absenteesText}

Kechikib kelgan:
\${latesText}\`;

      try {
        const fetch = require('node-fetch'); // Yoki global fetch
        const token = process.env.TELEGRAM_BOT_TOKEN || '8983797302:AAHrMF0yZQ0qOgRGgE96SL6nV5hMKPdD_p4';
        
        // Guruhga
        await globalThis.fetch(\`https://api.telegram.org/bot\${token}/sendMessage\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: '-5459131960', text: groupMsg, parse_mode: 'HTML' })
        });
        
        // Ustozga
        await globalThis.fetch(\`https://api.telegram.org/bot\${token}/sendMessage\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: '1973751873', text: ustozMsg, parse_mode: 'HTML' })
        });
      } catch(e) {
        console.error(e);
      }
    }
`;

if (findSubmitLogic.test(code)) {
  code = code.replace(findSubmitLogic, submitLogicReplacement.trim());
  fs.writeFileSync('app/api/attendance/route.ts', code);
  console.log("Updated!");
} else {
  console.log("Could not find submit logic!");
}
