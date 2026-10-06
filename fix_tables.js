const fs = require('fs');

const files = [
  'app/admin/attendance/page.tsx',
  'app/admin/students/page.tsx',
  'app/admin/users/page.tsx',
  'app/starssa/attendance/page.tsx',
  'app/starssa/students/page.tsx',
  'app/ustoz/students/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace the opening table tag with a wrapper + clean table tag
  content = content.split('<table className="min-w-full block md:table overflow-x-auto whitespace-nowrap md:whitespace-normal text-sm">').join('<div className="overflow-x-auto w-full">\n<table className="min-w-full text-sm whitespace-nowrap md:whitespace-normal">');
  
  // Replace closing table tag with closing table + closing wrapper div
  // But ONLY for the ones we wrapped. To be safe, we'll replace all </table> with </table></div> 
  // Wait, if a file has multiple tables, that could break. Let's count them.
  let tableCount = (content.match(/<table /g) || []).length;
  if (tableCount > 0) {
    // If we just replace </table> with </table>\n</div>, it will wrap every table.
    // Let's just do it, since all tables in these files were the ones causing issues.
    content = content.split('</table>').join('</table>\n</div>');
  }

  fs.writeFileSync(file, content);
  console.log('Fixed', file);
});
