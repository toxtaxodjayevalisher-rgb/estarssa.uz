const fs = require('fs');
let code = fs.readFileSync('app/api/attendance/route.ts', 'utf8');

if (!code.includes("import { sendTelegramMessage }")) {
  code = code.replace(
    "import { verifyAuth } from '@/lib/auth';", 
    "import { verifyAuth } from '@/lib/auth';\nimport { sendTelegramMessage } from '@/lib/telegram';"
  );
}

const editDraftReplacement = `
    if (data.action === 'edit_draft') {
      const sessionData = await prisma.attendanceSession.findUnique({
        where: { id: data.session_id },
        include: { created_by: true }
      });
      
      await prisma.attendanceSession.update({
        where: { id: data.session_id },
        data: { status: 'DRAFT', submitted_at: null, approved_by_id: null, approved_at: null }
      });
      
      if (sessionData) {
        const msg = \`⚠️ <b>DIQQAT! Davomat bekor qilindi!</b>\\n\\n👤 Xodim: <b>\${sessionData.created_by.full_name}</b>\\n📅 Sana: \${sessionData.date.toLocaleDateString()}\\n\\n❌ Oldingi yuborilgan davomat natijalari o'chirildi va STARSSA tomonidan qaytadan qilinmoqda.\`;
        await sendTelegramMessage(msg);
      }
      
      return NextResponse.json({ success: true });
    }
`;

code = code.replace(/if \(data\.action === 'edit_draft'\) \{[\s\S]*?return NextResponse\.json\(\{ success: true \}\);\s*\}/, editDraftReplacement.trim());

fs.writeFileSync('app/api/attendance/route.ts', code);
