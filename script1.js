const fs = require('fs');

// 1. Time picker for Kechikdi
let attFile = 'app/starssa/attendance/page.tsx';
let attCode = fs.readFileSync(attFile, 'utf8');
attCode = attCode.replace(/type="text"(\s*)placeholder=\{attendance\[s\.id\]\?\.status === 'KELMADI' \? "Sababni yozing\.\.\." : "Soatni yozing \(Masalan: 08:15\)"\}/g, 
  'type={attendance[s.id]?.status === \'KELMADI\' ? \'text\' : \'time\'} placeholder="Sababni yozing..."');
fs.writeFileSync(attFile, attCode);

// 2. Rename Dashboard to Asosiy in all pages
function replaceDashboard(dir) {
  let files = fs.readdirSync(dir);
  for (let f of files) {
    if (f === 'node_modules' || f === '.next') continue;
    let path = dir + '/' + f;
    if (fs.statSync(path).isDirectory()) replaceDashboard(path);
    else if (path.endsWith('.tsx')) {
      let code = fs.readFileSync(path, 'utf8');
      if (code.includes('>Dashboard</Link>')) {
        fs.writeFileSync(path, code.replace(/>Dashboard<\/Link>/g, '>Asosiy</Link>'));
      }
    }
  }
}
replaceDashboard('app');

console.log('Done 1 & 2');
