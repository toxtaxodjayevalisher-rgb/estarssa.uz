const fs = require('fs');
const file = 'app/admin/groups/[id]/page.tsx';

let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');
fs.writeFileSync(file, content);
console.log('Fixed groups page');
