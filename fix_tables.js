const fs = require('fs');

function fixTable(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if {idx + 1} is already there
  if (content.includes('{idx + 1}')) {
    console.log(`Already fixed: ${filePath}`);
    return;
  }

  // Change map(s => to map((s, idx) =>
  content = content.replace(/\{students\.map\(s => \{/g, '{students.map((s, idx) => {');
  content = content.replace(/\{students\.map\(\(s\) => \{/g, '{students.map((s, idx) => {');
  
  // Insert the td for sequence number right after <tr ...>
  content = content.replace(
    /(<tr[^>]*key=\{s\.id\}[^>]*>)/g,
    '$1\n                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">{idx + 1}</td>'
  );

  fs.writeFileSync(filePath, content);
  console.log(`Fixed: ${filePath}`);
}

['app/ustoz/students/page.tsx', 'app/starssa/students/page.tsx', 'app/admin/students/page.tsx'].forEach(fixTable);
