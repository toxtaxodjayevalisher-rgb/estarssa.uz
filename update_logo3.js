const fs = require('fs');
const path = require('path');

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
  if (code.includes('E-STARSSA</div>')) {
    code = code.replace(/<div className="[^"]*">E-STARSSA<\/div>/g, 
      `<div className="p-6 text-2xl font-serif font-bold border-b border-slate-700 text-center text-white tracking-widest">E-STARSSA</div>`);
    fs.writeFileSync(file, code);
    count++;
  }
}

console.log('Fayllar ozgartirildi: ' + count);
