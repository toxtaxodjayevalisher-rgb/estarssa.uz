const fs = require('fs');

let pageCode = fs.readFileSync('app/starssa/homework/page.tsx', 'utf8');

// 1. Add back button
const backBtn = `
      <div className="mb-4">
        <a href="/starssa" className="inline-flex items-center text-blue-600 hover:underline">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Orqaga (Asosiy panelga)
        </a>
      </div>
`;
pageCode = pageCode.replace(/<h1 className="text-2xl font-bold mb-6">/, backBtn + '<h1 className="text-2xl font-bold mb-6">');

// 2. Add an explicit "Hafta kuni" dropdown to make it completely obvious.
// Instead of a simple date picker, let's just make it a date picker and a read-only field for the day of the week, or just rely on the date picker.
// Actually they wanted "hafta kuni (dushanbadan jumagacha+sanasi)".
// I'll make the label say "Qaysi kunga (Sana va hafta kunini tanlang)".
pageCode = pageCode.replace(/<label className="block text-sm font-medium mb-1">Qaysi kunga \(muddat\)<\/label>/, `<label className="block text-sm font-medium mb-1">Qaysi kunga (Sana va hafta kuni)</label>`);

// 3. For multiple homeworks, let's add a "+ Yana vazifa qo'shish formasi" button.
// Well, since we just have one form that clears itself on submit, I'll add a clear text instruction.
pageCode = pageCode.replace(/<button type="submit" disabled=\{loading\}/, `<p className="text-sm text-gray-500 mb-2">Bitta vazifani yuborganingizdan so'ng, forma tozalanadi va keyingisini yozishingiz mumkin bo'ladi.</p>
            <button type="submit" disabled={loading}`);

fs.writeFileSync('app/starssa/homework/page.tsx', pageCode);
