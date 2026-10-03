const fs = require('fs');

let text = fs.readFileSync('app/starssa/page.tsx', 'utf8');

// Add handleRevert function
if (!text.includes('const handleRevert')) {
  text = text.replace(
    'return (',
    `const handleRevert = async () => {
    if (!stats?.session_id) return;
    if (!confirm('Haqiqatan ham bugungi davomatni bekor qilib, qaytadan qilasizmi?')) return;
    
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'edit_draft', session_id: stats.session_id })
    });
    
    if (res.ok) {
      alert('Davomat bekor qilindi. Endi qaytadan yuborishingiz mumkin.');
      window.location.reload();
    }
  };

  return (`
  );
}

// Add the button UI
text = text.replace(
  /<p className="text-gray-700 text-lg">Siz o'z vazifangizni 80% ni bajardingiz\.<\/p>\s*<\/div>/,
  `<p className="text-gray-700 text-lg">Siz o'z vazifangizni 80% ni bajardingiz.</p>
            <div className="mt-6 pt-4 border-t border-gray-200">
               <p className="text-gray-600 mb-2 font-medium">Bu aniq to'g'rimi? Xato ketgan bo'lsa, qaytadan tahrirlashingiz mumkin:</p>
               <button onClick={handleRevert} className="bg-red-50 text-red-600 px-4 py-2 rounded border border-red-200 hover:bg-red-100 font-bold transition">
                 Davomatni bekor qilib, qayta qilish
               </button>
            </div>
          </div>`
);

fs.writeFileSync('app/starssa/page.tsx', text);
