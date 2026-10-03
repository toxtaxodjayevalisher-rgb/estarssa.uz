const fs = require('fs');

function updatePage(filePath) {
  let text = fs.readFileSync(filePath, 'utf8');
  
  // Add birth_date to Student type if not there
  text = text.replace(/type Student = \{.*?\};/, 'type Student = { id: string, full_name: string, group_name: string, phone: string | null, birth_date: string | null };');
  
  // Update table header
  if(!text.includes("Tug'ilgan sana")) {
    text = text.replace(/<th.*?Guruh.*?<\/th>/, '<th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Guruh</th>\n                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Tug\'ilgan sana</th>');
  }

  // Update table row
  text = text.replace(/<td className="px-6 py-4 whitespace-nowrap">\{s\.group_name\}<\/td>/, '<td className="px-6 py-4 whitespace-nowrap">{s.group_name}</td>\n                    <td className="px-6 py-4 whitespace-nowrap">{s.birth_date ? new Date(s.birth_date).toLocaleDateString() : \'-\'}</td>');
  
  // Update phone link
  text = text.replace(/<td className="px-6 py-4 whitespace-nowrap">\{s\.phone \|\| '\\-'\}<\/td>/, '<td className="px-6 py-4 whitespace-nowrap">\n                      {s.phone ? <a href={`tel:${s.phone.replace(/\\s/g, \'\')}`} className="text-blue-600 hover:underline font-medium">{s.phone}</a> : \'-\'}\n                    </td>');

  fs.writeFileSync(filePath, text);
}

updatePage('app/admin/students/page.tsx');
updatePage('app/starssa/students/page.tsx');
updatePage('app/ustoz/students/page.tsx');
