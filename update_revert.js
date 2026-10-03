const fs = require('fs');

// Backend Update
let apiCode = fs.readFileSync('app/api/attendance/route.ts', 'utf8');
apiCode = apiCode.replace(
  /await prisma\.attendanceSession\.update\(\{\s*where: \{ id: data\.session_id \},\s*data: \{ status: 'DRAFT', submitted_at: null, approved_by_id: null, approved_at: null \}\s*\}\);/,
  `await prisma.attendance.deleteMany({ where: { session_id: data.session_id } });
      await prisma.attendanceSession.update({
        where: { id: data.session_id },
        data: { status: 'DRAFT', submitted_at: null, approved_by_id: null, approved_at: null }
      });`
);
fs.writeFileSync('app/api/attendance/route.ts', apiCode);

// Frontend Update
let pageCode = fs.readFileSync('app/starssa/page.tsx', 'utf8');
pageCode = pageCode.replace(
  /alert\('Davomat bekor qilindi\. Endi qaytadan yuborishingiz mumkin\.'\);\s*window\.location\.reload\(\);/,
  `alert('Davomat bekor qilindi. Davomat qilish sahifasiga yo\\'naltirilmoqdasiz...');
        window.location.href = '/starssa/attendance';`
);
fs.writeFileSync('app/starssa/page.tsx', pageCode);
