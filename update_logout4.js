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

  // Let's find exactly the wrapper div of the logout button
  const regex = /<div className="p-4 [^"]*border-t[^"]*">[\s\S]*?<div className="text-sm mb-2">Akkaunt: [^<]+<\/div>[\s\S]*?<button onClick=\{handleLogout\}[^>]*>Chiqish<\/button>\s*<\/div>/g;
  
  if (regex.test(code)) {
    code = code.replace(regex, `<div className="p-4 mt-auto border-t border-slate-800">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-600 px-4 py-3 rounded-xl text-red-500 hover:text-white font-semibold transition-all group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Chiqish
        </button>
      </div>`);
    changed = true;
  }

  // Also in files where Akkaunt text was already removed by earlier script but maybe I want to ensure they look identical
  
  if (changed) {
    fs.writeFileSync(file, code);
    count++;
  }
}

console.log('Modified files: ' + count);
