const fs = require('fs');

let content = fs.readFileSync('app/admin/students/page.tsx', 'utf8');

content = content.replace(
  `<td className="px-6 py-4 font-semibold text-lg">{g.name}</td>`,
  `<td className="px-6 py-4 font-semibold text-lg"><Link href={\`/admin/groups/\${g.id}\`} className="text-blue-600 hover:underline">{g.name}</Link></td>`
);

fs.writeFileSync('app/admin/students/page.tsx', content);
console.log('Fixed students page links');
