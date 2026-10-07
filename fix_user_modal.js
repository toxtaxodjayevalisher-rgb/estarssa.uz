const fs = require('fs');

let content = fs.readFileSync('app/admin/users/page.tsx', 'utf8');

// 1. Add font-sans to modal container
content = content.replace(
  'className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all max-h-[90vh] overflow-y-auto"',
  'className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all max-h-[90vh] overflow-y-auto font-sans antialiased"'
);

// 2. Fix close button (replace ? or × with a nice SVG)
content = content.replace(
  /<button onClick=\{\(\) => setShowForm\(false\)\} className="text-gray-400 hover:text-gray-600">\s*(.*?)\s*<\/button>/g,
  `<button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>`
);

// 3. Fix "+ Yangi guruh ochish" button layout
content = content.replace(
  /className="text-xs text-blue-600 font-bold hover:text-blue-800 transition-colors"/g,
  'className="text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md font-bold hover:bg-blue-100 transition-colors whitespace-nowrap shadow-sm"'
);

// 4. Improve input fields look across the form
content = content.replace(
  /className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none/g,
  'className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all text-gray-800'
);

// 5. Enhance modal title and labels
content = content.replace(
  /className="text-2xl font-bold text-gray-800"/g,
  'className="text-2xl font-extrabold text-slate-800 tracking-tight"'
);
content = content.replace(
  /className="block text-sm font-semibold text-gray-700 mb-1"/g,
  'className="block text-sm font-bold text-slate-700 mb-1.5"'
);
content = content.replace(
  /className="block text-sm font-semibold text-gray-700"/g,
  'className="block text-sm font-bold text-slate-700"'
);

fs.writeFileSync('app/admin/users/page.tsx', content);
console.log('Fixed users page design');
