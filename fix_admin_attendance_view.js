const fs = require('fs');
let content = fs.readFileSync('app/admin/attendance/page.tsx', 'utf8');

// Add viewSession state
content = content.replace(
  `const [holidayForm, setHolidayForm] = useState({ date: '', group_name: '' });`,
  `const [holidayForm, setHolidayForm] = useState({ date: '', group_name: '' });\n  const [viewSession, setViewSession] = useState<any>(null);`
);

// Add "Ko'rish" button
content = content.replace(
  `<button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800 font-medium">Bekor qilish</button>`,
  `<button onClick={() => setViewSession(s)} className="text-blue-600 hover:text-blue-800 font-medium mr-3">Ko'rish</button>\n                      <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800 font-medium">Bekor qilish</button>`
);

// Add modal logic before the end
const modalCode = `
        {viewSession && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{viewSession.group_name} guruhi davomati</h2>
                  <p className="text-gray-500 mt-1">{new Date(viewSession.date).toLocaleDateString()}</p>
                </div>
                <button onClick={() => setViewSession(null)} className="text-gray-400 hover:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-600">O'quvchi F.I.SH.</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Holati</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Izoh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {viewSession.records?.map((r: any) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 font-medium text-gray-800">{r.student.full_name}</td>
                        <td className="px-4 py-3">
                          {r.status === 'KELDI' && <span className="px-2 py-1 bg-green-100 text-green-700 font-bold rounded-lg text-xs">Keldi</span>}
                          {r.status === 'KELMADI' && <span className="px-2 py-1 bg-red-100 text-red-700 font-bold rounded-lg text-xs">Kelmadi</span>}
                          {r.status === 'SABABLI' && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 font-bold rounded-lg text-xs">Sababli</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{r.note || '-'}</td>
                      </tr>
                    ))}
                    {(!viewSession.records || viewSession.records.length === 0) && (
                      <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">Bu davomat bo'yicha ma'lumot yo'q (yoki Bayram)</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button onClick={() => setViewSession(null)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-all">Yopish</button>
              </div>
            </div>
          </div>
        )}
`;

content = content.replace(
  `      </div>\n    </div>\n  );\n}`,
  modalCode + `\n      </div>\n    </div>\n  );\n}`
);

// If it has escaped backticks, fix them just in case (the previous script didn't touch new additions, but wait we are just replacing strings)
fs.writeFileSync('app/admin/attendance/page.tsx', content);
console.log('Fixed attendance viewing');
