const fs = require('fs');

let content = fs.readFileSync('app/starssa/attendance/page.tsx', 'utf8');

// Add sequence number to table headers
if (!content.includes('<th className="text-left px-2 sm:px-4 py-3 font-medium text-gray-500 uppercase w-10">#</th>')) {
  content = content.replace(
    '<th className="text-left px-4 py-3 font-medium text-gray-500 uppercase">O\'quvchi</th>',
    '<th className="text-left px-2 sm:px-4 py-3 font-medium text-gray-500 uppercase w-10">#</th>\n                    <th className="text-left px-2 sm:px-4 py-3 font-medium text-gray-500 uppercase">O\'quvchi</th>'
  );
}

// Add sequence number to table body, and map(s => to map((s, idx) => 
content = content.replace(/\{students\.map\(s => \(/g, '{students.map((s, idx) => (');
content = content.replace(
  /<td className="px-4 py-4 whitespace-nowrap font-medium w-1\/3">\{s\.full_name\}/g,
  '<td className="px-2 sm:px-4 py-3 whitespace-nowrap text-gray-500">{idx + 1}</td>\n                      <td className="px-2 sm:px-4 py-3 whitespace-normal font-medium w-1/3 sm:whitespace-nowrap">{s.full_name}'
);

// Fix flex for buttons to wrap on mobile, and make padding smaller on mobile
content = content.replace(
  /<td className="px-4 py-4 whitespace-nowrap flex space-x-2">/g,
  '<td className="px-2 sm:px-4 py-3 flex flex-wrap sm:flex-nowrap gap-2">'
);

// Reduce text sizes for buttons on mobile
content = content.replace(
  /className=\{`px-3 py-1 rounded \$\{attendance\[s\.id\]\?\.status/g,
  'className={`px-2 py-1.5 sm:px-3 sm:py-1 rounded text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 ${attendance[s.id]?.status'
);

// Title wrapping fix
content = content.replace(
  '<div className="flex justify-between items-center mb-6">',
  '<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">'
);

fs.writeFileSync('app/starssa/attendance/page.tsx', content);
console.log('Fixed starssa attendance mobile view and added seq nums');
