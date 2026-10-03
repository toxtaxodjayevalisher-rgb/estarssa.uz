const fs = require('fs');

const roles = ['admin', 'ustoz', 'starssa'];

for (const role of roles) {
  const file = `app/${role}/announcements/page.tsx`;
  let code = fs.readFileSync(file, 'utf8');

  // Find the return statement and remove the trailing "use client" and imports inside it
  code = code.replace(/return\s*\(\s*"use client";\s*import Link from 'next\/link';(\s*import \{ [^}]+ \} from 'react';)?/g, 'return (');
  
  fs.writeFileSync(file, code);
}
console.log('Fixed announcements pages');
