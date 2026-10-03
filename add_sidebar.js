const fs = require('fs');
let code = fs.readFileSync('app/starssa/homework/page.tsx', 'utf8');

const sidebarWrap = `<div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-700 text-center">E-STARSSA</div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="/starssa" className="block px-4 py-2 hover:bg-slate-800 rounded">Asosiy</a>
          <a href="/starssa/students" className="block px-4 py-2 hover:bg-slate-800 rounded">O'quvchilar</a>
          <a href="/starssa/attendance" className="block px-4 py-2 hover:bg-slate-800 rounded">Davomat Qilish</a>
          <a href="/starssa/history" className="block px-4 py-2 hover:bg-slate-800 rounded">Davomat Tarixi</a>
          <a href="/starssa/homework" className="block px-4 py-2 bg-blue-600 rounded">Uyga Vazifa</a>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <p className="text-sm">Akkaunt: STARSSA</p>
          <button className="mt-2 w-full bg-red-600 px-4 py-2 rounded text-white text-sm" onClick={() => {
            fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/login');
          }}>Chiqish</button>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-y-auto text-black relative">
`;

code = code.replace(/<div className="space-y-6">/, sidebarWrap + '        <div className="space-y-6">');

// Remove the back button we just added, as the sidebar handles navigation now
code = code.replace(/<div className="mb-4">\s*<a href="\/starssa"[\s\S]*?<\/div>/, '');

code = code.replace(/<\/div>\s*$/, '      </div>\n    </div>\n    </div>\n  );\n}\n');

fs.writeFileSync('app/starssa/homework/page.tsx', code);
