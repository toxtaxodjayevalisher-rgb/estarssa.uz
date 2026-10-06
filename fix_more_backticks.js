const fs = require('fs');

const files = [
  'app/api/admin/attendance/[id]/route.ts',
  'app/admin/users/page.tsx',
  'app/admin/students/page.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\\`/g, '`');
    content = content.replace(/\\\$/g, '$');
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
}
