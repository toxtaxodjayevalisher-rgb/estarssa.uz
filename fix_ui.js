const fs = require('fs');
let code = fs.readFileSync('app/ustoz/approve/page.tsx', 'utf8');

code = code.replace(
  /if \(res\.ok\) \{[\s\S]*?setSessions\(sessions\.filter\(s => s\.id !== session_id\)\);\s*\}/,
  `if (res.ok) {
        if (action === 'approve') alert('Davomat tasdiqlandi!');
        if (action === 'redo') alert('Davomat qayta qilinishi uchun Starssaga qaytarildi!');
        if (action === 'reject') alert('Davomat butunlay bekor qilindi!');
        
        setSessions(sessions.filter(s => s.id !== session_id));
      } else {
        const text = await res.text();
        alert('Xatolik: ' + text);
      }`
);
fs.writeFileSync('app/ustoz/approve/page.tsx', code);
