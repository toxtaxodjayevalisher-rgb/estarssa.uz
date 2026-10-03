const fs = require('fs');

let apiCode = fs.readFileSync('app/api/homework/route.ts', 'utf8');

// Replace file saving with base64 conversion
apiCode = apiCode.replace(/let image_url = null;[\s\S]*?image_url = `\/uploads\/\$\{filename\}`;[\s\S]*?\}/, `let image_url = null;
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const base64 = buffer.toString('base64');
      const mimeType = image.type || 'image/jpeg';
      image_url = \`data:\${mimeType};base64,\${base64}\`;
    }`);

// Also remove fs and path imports if they are not used elsewhere
apiCode = apiCode.replace(/import fs from 'fs';\nimport path from 'path';\n/, '');

// Format date nicely
apiCode = apiCode.replace(/const hwDate = new Date\(dateStr\)\.toLocaleDateString\('uz-UZ'\);/, `const d = new Date(dateStr);
    const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
    const hwDate = \`\${days[d.getDay()]} (\${d.getDate()}-\${months[d.getMonth()]})\`;`);

fs.writeFileSync('app/api/homework/route.ts', apiCode);

let pageCode = fs.readFileSync('app/starssa/homework/page.tsx', 'utf8');
pageCode = pageCode.replace(/<div>\s*<label className=\"block text-sm font-medium mb-1\">Qaysi kunga \(muddat\)<\/label>\s*<input type=\"date\".*?\/>\s*<\/div>/, `<div>
            <label className="block text-sm font-medium mb-1">Qaysi kunga (muddat)</label>
            <input type="date" required className="w-full border p-2 rounded" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            {formData.date && <p className="text-xs text-gray-500 mt-1">Tanlangan kun: {new Date(formData.date).toLocaleDateString('uz-UZ', {weekday: 'long', day: 'numeric', month: 'long'})}</p>}
          </div>`);

// Change UI to have ability to submit multiple. Actually they just want the form to reset so they can add another.
// Wait, in `pageCode`, after successful submit, we do `setFormData({ date: '', group_name: '', subject: '', content: '' }); setImage(null);` which already allows them to submit another!
// I'll just add an alert or notification.
pageCode = pageCode.replace(/setHomeworks\(\[resData, \.\.\.homeworks\]\);/, `setHomeworks([resData, ...homeworks]);\n        alert("Uyga vazifa muvaffaqiyatli saqlandi! Yana qo'shishingiz mumkin.");`);

fs.writeFileSync('app/starssa/homework/page.tsx', pageCode);
