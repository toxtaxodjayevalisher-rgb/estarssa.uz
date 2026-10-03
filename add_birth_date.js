const fs = require('fs');

function addBirthDateToForm(filePath) {
  let text = fs.readFileSync(filePath, 'utf8');
  
  if (text.includes('setFormData({ full_name: \'\', group_name: \'\', phone: \'\' })')) {
    text = text.replace(/setFormData\(\{ full_name: '', group_name: '', phone: '' \}\)/g, 'setFormData({ full_name: \'\', group_name: \'\', phone: \'\', birth_date: \'\' })');
  }
  
  if (text.includes('const [formData, setFormData] = useState({ full_name: \'\', group_name: \'\', phone: \'\' });')) {
    text = text.replace(/const \[formData, setFormData\] = useState\(\{ full_name: '', group_name: '', phone: '' \}\);/, 'const [formData, setFormData] = useState({ full_name: \'\', group_name: \'\', phone: \'\', birth_date: \'\' });');
  }
  
  if (!text.includes('placeholder="Tug\'ilgan sana"')) {
    text = text.replace(/<input placeholder="Telefon raqam"/, '<input type="date" placeholder="Tug\'ilgan sana" className="w-full border p-2 mb-3 rounded" value={formData.birth_date || \'\'} onChange={e => setFormData({...formData, birth_date: e.target.value})} />\n                <input placeholder="Telefon raqam"');
  }

  fs.writeFileSync(filePath, text);
}

addBirthDateToForm('app/admin/students/page.tsx');
addBirthDateToForm('app/starssa/students/page.tsx');

let apiText = fs.readFileSync('app/api/students/route.ts', 'utf8');
if (!apiText.includes('birth_date')) {
    apiText = apiText.replace(/const \{ full_name, group_name, phone \} = data;/, 'const { full_name, group_name, phone, birth_date } = data;');
    apiText = apiText.replace(/phone: phone \|\| null/, 'phone: phone || null, birth_date: birth_date ? new Date(birth_date) : null');
    fs.writeFileSync('app/api/students/route.ts', apiText);
}
