const fs = require('fs');

const files = [
  'app/admin/attendance/page.tsx',
  'app/api/announcements/route.ts',
  'app/api/announcements/[id]/route.ts',
  'app/components/AnnouncementsClient.tsx',
  'lib/telegram.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Replace backslash + backtick with just backtick
  content = content.replace(/\\`/g, '`');
  // Replace backslash + dollar with just dollar (if I escaped those too)
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
}
