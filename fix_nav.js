const fs = require('fs');
const glob = require('glob');

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

function replaceNav(globPattern, newNav) {
  glob.sync(globPattern).forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/<nav className="flex-1 p-4 space-y-2">[\s\S]*?<\/nav>/, newNav);
    fs.writeFileSync(file, content);
  });
}

replaceNav('app/starssa/**/*.tsx', starssaNav);
replaceNav('app/ustoz/**/*.tsx', ustozNav);
