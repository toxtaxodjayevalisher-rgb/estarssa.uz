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

  // Replace desktop logout button
  const btn1 = /<button onClick=\{handleLogout\} ([^>]*)>([\s\S]*?)Chiqish\s*<\/button>/g;
  if (btn1.test(code)) {
    code = code.replace(btn1, `<Link href="/logout" $1>$2Chiqish</Link>`);
    changed = true;
  }

  // Replace mobile logout button
  const btn2 = /<button onClick=\{typeof handleLogout !== 'undefined' \? handleLogout : \(\) => \{\}\} ([^>]*)>([\s\S]*?)<\/button>/g;
  if (btn2.test(code)) {
    code = code.replace(btn2, `<Link href="/logout" $1>$2</Link>`);
    changed = true;
  }

  // Also remove unused handleLogout variables if they exist
  code = code.replace(/const handleLogout = async \(\) => \{[\s\S]*?router\.push\('\/login'\);\s*\};/g, '');

  if (changed) {
    fs.writeFileSync(file, code);
    count++;
  }
}

console.log('Fixed logout links in: ' + count + ' files');
