const fs = require('fs');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('app');
let count = 0;

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (code.includes('<Link') && !code.includes("import Link from 'next/link'") && !code.includes('import Link from "next/link"')) {
    // Add import statement at the top, after "use client" if it exists
    if (code.startsWith('"use client";') || code.startsWith("'use client';")) {
      code = code.replace(/^(['"]use client['"];?)/, "$1\nimport Link from 'next/link';");
    } else {
      code = "import Link from 'next/link';\n" + code;
    }
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, code);
    count++;
  }
}

console.log('Fixed imports in: ' + count + ' files');
