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
  if (code.includes('alt="E-STARSSA"')) {
    code = code.replace(/<div className="p-6 flex justify-center items-center border-b border-slate-700">[\s\S]*?<img src="\/icon\.png" alt="E-STARSSA" className="h-16 object-contain" \/>[\s\S]*?<\/div>/g, 
      `<div className="p-6 text-3xl font-serif font-bold border-b border-slate-700 text-center tracking-wider text-white" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.4)' }}>E-STARSSA</div>`);
    fs.writeFileSync(file, code);
    count++;
  }
}

console.log('Fayllar ozgartirildi: ' + count);
