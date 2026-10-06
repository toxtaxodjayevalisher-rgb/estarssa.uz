const fs = require('fs');

let content = fs.readFileSync('app/admin/attendance/page.tsx', 'utf8');

// Add import
if (!content.includes("import * as XLSX")) {
  content = content.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport * as XLSX from 'xlsx';");
}

// Add export function before return
const exportFn = `
  const exportToExcel = () => {
    const data: any[] = [];
    sessions.forEach(s => {
      if (s.records && s.records.length > 0) {
        s.records.forEach((r: any) => {
          data.push({
            'Sana': new Date(s.date).toLocaleDateString(),
            'Guruh': s.group_name,
            "O'quvchi F.I.SH.": r.student?.full_name || 'Noma\`lum',
            'Holati': r.status === 'KELDI' || r.status === 'Keldi' ? 'Keldi' : r.status === 'KELMADI' || r.status === 'Kelmadi' ? 'Kelmadi' : 'Sababli',
            'Izoh': r.note || '',
            'Tasdiqlangan': s.status === 'APPROVED' ? 'Tasdiqlangan' : s.status === 'HOLIDAY' ? 'Bayram' : 'Kutilyapti'
          });
        });
      } else {
         data.push({
            'Sana': new Date(s.date).toLocaleDateString(),
            'Guruh': s.group_name,
            "O'quvchi F.I.SH.": '-',
            'Holati': s.status === 'HOLIDAY' ? 'Bayram/Dam olish' : s.status,
            'Izoh': '-',
            'Tasdiqlangan': '-'
         });
      }
    });
    if (data.length === 0) {
      alert("Yuklab olish uchun davomat ma'lumotlari yo'q");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Davomat");
    XLSX.writeFile(workbook, "Davomat_Hisoboti.xlsx");
  };
`;

if (!content.includes("const exportToExcel")) {
  content = content.replace("return (", exportFn + "\n  return (");
}

// Add button
const buttonsReplacement = `          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold">Davomat Nazorati</h1>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Excel (Yuklab olish)
              </button>
              <button onClick={() => setShowHolidayForm(true)} className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-all flex-1 sm:flex-none">+ Bayram</button>
            </div>
          </div>`;

content = content.replace(/<div className="flex justify-between items-center mb-6">[\s\S]*?<\/div>/, buttonsReplacement);

fs.writeFileSync('app/admin/attendance/page.tsx', content);
console.log('Done modifying attendance page');
