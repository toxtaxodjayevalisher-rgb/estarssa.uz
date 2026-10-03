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
  let changed = false;

  const roleMatch = file.match(/app\/(admin|ustoz|starssa)/);
  if (!roleMatch) continue;
  const role = roleMatch[1];

  // Make sure we haven't already added it
  if (!code.includes(`href="/${role}/announcements"`)) {
    // Find the end of <nav>
    const navEndRegex = /(<\/nav>)/;
    if (navEndRegex.test(code)) {
      const linkHtml = `\n          <Link href="/${role}/announcements" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">E'lonlar</Link>\n        $1`;
      code = code.replace(navEndRegex, linkHtml);
      changed = true;
    }
  }

  // Active state for announcements page itself
  if (file.endsWith(`app/${role}/announcements/page.tsx`)) {
    code = code.replace(
      `href="/${role}/announcements" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1"`,
      `href="/${role}/announcements" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all transform hover:scale-[1.02] text-white"`
    );
    // Demote Asosiy
    code = code.replace(
      `href="/${role}" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all transform hover:scale-[1.02]"`,
      `href="/${role}" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1"`
    );
    fs.writeFileSync(file, code);
    continue;
  }

  if (changed) {
    fs.writeFileSync(file, code);
    count++;
  }
}

console.log('Added E`lonlar to sidebar in: ' + count + ' files');
