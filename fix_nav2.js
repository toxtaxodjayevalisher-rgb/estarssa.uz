const fs = require('fs');
const path = require('path');

const starssaNav = `        <nav className="flex-1 p-4 space-y-2">
          <Link href="/starssa" className="block px-4 py-2 hover:bg-slate-800 rounded">Dashboard</Link>
          <Link href="/starssa/students" className="block px-4 py-2 hover:bg-slate-800 rounded">O'quvchilar</Link>
          <Link href="/starssa/attendance" className="block px-4 py-2 hover:bg-slate-800 rounded">Davomat Qilish</Link>
        </nav>`;

const ustozNav = `        <nav className="flex-1 p-4 space-y-2">
          <Link href="/ustoz" className="block px-4 py-2 hover:bg-slate-800 rounded">Dashboard</Link>
          <Link href="/ustoz/students" className="block px-4 py-2 hover:bg-slate-800 rounded">O'quvchilar</Link>
          <Link href="/ustoz/approve" className="block px-4 py-2 hover:bg-slate-800 rounded">Tasdiqlash</Link>
          <Link href="/ustoz/history" className="block px-4 py-2 hover:bg-slate-800 rounded">Davomat Tarixi</Link>
        </nav>`;

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if(fs.statSync(dirPath).isDirectory()) walkDir(dirPath, callback);
    else callback(dirPath);
  });
}

walkDir('app/starssa', f => {
  if (f.endsWith('.tsx')) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/<nav className="flex-1 p-4 space-y-2">[\s\S]*?<\/nav>/, starssaNav);
    fs.writeFileSync(f, content);
  }
});

walkDir('app/ustoz', f => {
  if (f.endsWith('.tsx')) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/<nav className="flex-1 p-4 space-y-2">[\s\S]*?<\/nav>/, ustozNav);
    fs.writeFileSync(f, content);
  }
});
