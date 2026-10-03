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
    code = code.replace(/<div className="p-6 text-2xl font-bold border-b border-slate-700 text-center">E-STARSSA<\/div>/g, 
      `<div className="p-6 flex justify-center items-center border-b border-slate-700">
          <img src="/icon.png" alt="E-STARSSA" className="h-16 object-contain" />
        </div>`);
    fs.writeFileSync(file, code);
    count++;
  }
}

console.log('Fayllar o`zgartirildi: ' + count);
