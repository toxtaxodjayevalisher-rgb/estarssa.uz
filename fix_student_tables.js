const fs = require('fs');

const fixTable = (file) => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace header for F.I.SH. with # and F.I.SH.
  content = content.replace(
    /<th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">F\.I\.SH\.<\/th>/g,
    '<th className="text-left px-6 py-4 font-medium text-gray-500 uppercase w-16">#</th>\n                          <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">F.I.SH.</th>'
  );

  // Replace map function for students
  content = content.replace(
    /\.map\(s => \(/g,
    '.map((s, idx) => ('
  );

  // Replace map function for ustoz and starssa students map which might be different
  content = content.replace(
    /students\.map\(s => \(/g,
    'students.map((s, idx) => ('
  );
  
  // Also fix filtered map if it exists
  content = content.replace(
    /students\.filter\((.*?)\)\.map\(s => \(/g,
    'students.filter($1).map((s, idx) => ('
  );

  // Replace the F.I.SH cell to also include the # cell before it
  content = content.replace(
    /<td className="px-6 py-4 font-semibold">{s\.full_name}<\/td>/g,
    '<td className="px-6 py-4 text-gray-500 font-bold">{idx + 1}</td>\n                            <td className="px-6 py-4 font-semibold">{s.full_name}</td>'
  );

  // Update colSpan={5} to colSpan={6} (Admin students table empty state)
  content = content.replace(/colSpan=\{5\}/g, 'colSpan={6}');
  // Update colSpan={8} to colSpan={9} (Starssa students table empty state)
  content = content.replace(/colSpan=\{8\}/g, 'colSpan={9}');
  // Update colSpan={7} to colSpan={8} (Ustoz students table empty state)
  content = content.replace(/colSpan=\{7\}/g, 'colSpan={8}');

  fs.writeFileSync(file, content);
  console.log('Fixed', file);
};

['app/admin/students/page.tsx', 'app/starssa/students/page.tsx', 'app/ustoz/students/page.tsx'].forEach(fixTable);
