const fs = require('fs');
let code = fs.readFileSync('app/api/attendance/route.ts', 'utf8');

const searchStr = 'const msg = `';
const endStr = 'await sendTelegramMessage(msg);';

const startIndex = code.indexOf(searchStr);
const endIndex = code.indexOf(endStr, startIndex);

if (startIndex > -1 && endIndex > -1) {
  const before = code.substring(0, startIndex);
  const after = code.substring(endIndex);
  code = before + 'const msg = `⚠️ <b>DIQQAT! Davomat bekor qilindi!</b>\\n\\n👤 Bekor qilgan xodim (login): <b>${auth.username}</b>\\n\\n⏳ 5 daqiqa ichida qayta davomat qilishi lozim!`;\n          ' + after;
  fs.writeFileSync('app/api/attendance/route.ts', code);
}
