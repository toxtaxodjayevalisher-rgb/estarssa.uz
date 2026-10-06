const fs = require('fs');
let content = fs.readFileSync('app/admin/students/page.tsx', 'utf8');

// Add state
content = content.replace(
  `const [students, setStudents] = useState<Student[]>([]);`,
  `const [students, setStudents] = useState<Student[]>([]);\n  const [filterGroup, setFilterGroup] = useState<string>('');`
);

// Add filter UI
const filterHtml = `
              <div>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-gray-600 font-medium">Filtrlash:</label>
                    <select 
                      className="border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={filterGroup}
                      onChange={(e) => setFilterGroup(e.target.value)}
                    >
                      <option value="">Barcha guruhlar</option>
                      {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                    </select>
                  </div>
                  <button onClick={() => { setEditingStudentId(null); setStudentForm({ full_name: '', group_name: '', phone: '', birth_date: '' }); setShowStudentForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 shadow-lg active:scale-95 transition-all">
                    + O'quvchi qo'shish
                  </button>
                </div>
`;

content = content.replace(
  `              <div>\n                <div className="flex justify-end mb-4">\n                  <button onClick={() => { setEditingStudentId(null); setStudentForm({ full_name: '', group_name: '', phone: '', birth_date: '' }); setShowStudentForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 shadow-lg active:scale-95 transition-all">\n                    + O'quvchi qo'shish\n                  </button>\n                </div>`,
  filterHtml
);

// Apply filter logic
content = content.replace(
  `{students.map(s => (`,
  `{students.filter(s => filterGroup ? s.group_name === filterGroup : true).map(s => (`
);

// Empty state string logic update
content = content.replace(
  `{students.length === 0 && (<tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">O'quvchilar yo'q</td></tr>)}`,
  `{students.filter(s => filterGroup ? s.group_name === filterGroup : true).length === 0 && (<tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">O'quvchilar yo'q</td></tr>)}`
);

fs.writeFileSync('app/admin/students/page.tsx', content);
console.log('Fixed students filter');
