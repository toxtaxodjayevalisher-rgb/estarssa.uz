const fs = require('fs');

let code = fs.readFileSync('app/api/attendance/route.ts', 'utf8');

code = code.replace(
  /const msg = `⚠️ <b>DIQQAT! Davomat bekor qilindi!<\/b>\\n\\n👤 Xodim: <b>\$\{sessionData\.created_by\.full_name\}<\/b>\\n📅 Sana: \$\{sessionData\.date\.toLocaleDateString\(\)\}\\n\\n❌ Oldingi yuborilgan davomat natijalari o'chirildi va STARSSA tomonidan qaytadan qilinmoqda\.`;/,
  "const msg = `⚠️ <b>DIQQAT! Davomat bekor qilindi!</b>\\n\\n👤 Bekor qilgan xodim (login): <b>${auth.username}</b>\\n\\n⏳ 5 daqiqa ichida qayta davomat qilishi lozim!`;"
);

fs.writeFileSync('app/api/attendance/route.ts', code);
