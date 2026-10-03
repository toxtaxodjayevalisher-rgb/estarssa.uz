const fs = require('fs');
let code = fs.readFileSync('app/starssa/homework/page.tsx', 'utf8');

code = code.replace(/setFormData\(\{ date: '', group_name: '', content: '' \}\)/g, "setFormData({ date: '', group_name: '', subject: '', content: '' })");
code = code.replace(/const \[formData, setFormData\] = useState\(\{ date: '', group_name: '', content: '' \}\);/, "const [formData, setFormData] = useState({ date: '', group_name: '', subject: '', content: '' });");
code = code.replace(/body\.append\('date', formData\.date\);/, "body.append('date', formData.date);\n    body.append('subject', formData.subject);");

const oldInputs = `<div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Guruh nomi</label>
              <input required className="w-full border p-2 rounded" placeholder="Masalan: IG2-26" value={formData.group_name} onChange={e => setFormData({...formData, group_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Qaysi kunga (muddat)</label>
              <input type="date" required className="w-full border p-2 rounded" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
          </div>`;

const newInputs = `<div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Guruh nomi</label>
              <input required className="w-full border p-2 rounded" placeholder="Masalan: IG2-26" value={formData.group_name} onChange={e => setFormData({...formData, group_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fan</label>
              <input required className="w-full border p-2 rounded" placeholder="Masalan: Matematika" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Qaysi kunga (muddat)</label>
            <input type="date" required className="w-full border p-2 rounded" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>`;

code = code.replace(oldInputs, newInputs);
code = code.replace(/<span className=\"font-bold text-lg text-blue-800\">\{hw\.group_name\}<\/span>/, '<span className="font-bold text-lg text-blue-800">{hw.group_name} - {hw.subject}</span>');

fs.writeFileSync('app/starssa/homework/page.tsx', code);
