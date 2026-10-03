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

  // 1. Main layout wrapper
  if (code.includes('flex h-screen bg-gray-100')) {
    code = code.replace(/<div className="flex h-screen bg-gray-100">/g, '<div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">');
    changed = true;
  }

  // 2. Sidebar container
  if (code.includes('w-64 bg-[#0a1128] text-white shadow-2xl z-10 flex flex-col')) {
    code = code.replace(/w-64 bg-\[#0a1128\] text-white shadow-2xl z-10 flex flex-col/g, 'w-full md:w-64 bg-[#0a1128] text-white shadow-2xl z-20 flex flex-col flex-shrink-0');
    changed = true;
  }

  // 3. Logo text & Mobile logout
  if (code.includes('E-STARSSA</div>')) {
    code = code.replace(/<div className="p-6 text-2xl font-serif font-bold border-b border-slate-700 text-center text-white tracking-widest">E-STARSSA<\/div>/g, 
      `<div className="p-4 md:p-6 text-xl md:text-2xl font-serif font-bold border-b border-slate-700 flex justify-between md:justify-center items-center text-white tracking-widest"><span className="mx-auto md:mx-0">E-STARSSA</span><button onClick={typeof handleLogout !== 'undefined' ? handleLogout : () => {}} className="md:hidden text-red-500 p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></button></div>`);
    changed = true;
  }

  // 4. Nav container
  if (code.includes('flex-1 p-4 space-y-2')) {
    code = code.replace(/<nav className="flex-1 p-4 space-y-2">/g, '<nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-3 md:p-4 space-x-2 md:space-x-0 md:space-y-2 border-b md:border-none border-slate-800">');
    changed = true;
  }

  // 5. Desktop Logout box
  if (code.includes('p-4 mt-auto border-t border-slate-800"')) {
    code = code.replace(/className="p-4 mt-auto border-t border-slate-800"/g, 'className="p-4 mt-auto border-t border-slate-800 hidden md:block"');
    changed = true;
  }

  // 6. Main content container
  if (code.includes('flex-1 p-8 overflow-y-auto text-black relative')) {
    code = code.replace(/flex-1 p-8 overflow-y-auto text-black relative/g, 'flex-1 p-4 md:p-8 overflow-y-auto text-black relative w-full');
    changed = true;
  }

  // 7. Make links whitespace-nowrap and flex-shrink-0 for mobile nav
  code = code.replace(/<Link ([^>]*) className="block ([^"]*)"/g, '<Link $1 className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base $2"');

  // 8. Make tables responsive
  // Wrap <table ...> with <div className="overflow-x-auto w-full"> if it's not already wrapped.
  // Actually, simpler to just replace `<table ` with `<div className="overflow-x-auto w-full"><table ` and `</table>` with `</table></div>`
  // But doing that globally is risky. Instead, let's just add `block w-full overflow-x-auto` directly to the table class.
  code = code.replace(/<table className="min-w-full /g, '<table className="min-w-full block md:table overflow-x-auto whitespace-nowrap md:whitespace-normal ');

  // 9. Login form width
  if (code.includes('w-96')) {
    code = code.replace(/w-96/g, 'w-full max-w-md');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, code);
    count++;
  }
}

console.log('Responsive files modified: ' + count);
