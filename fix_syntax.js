const fs = require('fs');

let text = fs.readFileSync('app/starssa/page.tsx', 'utf8');

text = text.replace(/\{stats && \(stats\.status !== 'Boshlanmagan' \? \([\s\S]*?\)\)\}\s*<h2 className="text-xl font-bold mb-2 text-green-700">🎉 Tabriklaymiz!<\/h2>[\s\S]*?<Link href="\/starssa\/attendance" className="bg-blue-600 text-white px-6 py-2 rounded inline-block">Davomat qilishni boshlash<\/Link>\s*<\/div>\s*\)\}/m,
`{stats && (stats.status !== 'Boshlanmagan' ? (
          <div className="bg-white rounded-lg shadow p-6 mt-8 border-t-4 border-green-500">
            <h2 className="text-xl font-bold mb-2 text-green-700">🎉 Tabriklaymiz!</h2>
            <p className="text-gray-700 text-lg">Siz o'z vazifangizni 80% ni bajardingiz.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h2 className="text-xl font-bold mb-4">Davomatni boshlash</h2>
            <p className="text-gray-600 mb-4">Bugungi kun uchun davomatni yuritib, ustozga jo'nating.</p>
            <Link href="/starssa/attendance" className="bg-blue-600 text-white px-6 py-2 rounded inline-block">Davomat qilishni boshlash</Link>
          </div>
        ))}`
);
fs.writeFileSync('app/starssa/page.tsx', text);

let text2 = fs.readFileSync('app/ustoz/page.tsx', 'utf8');
text2 = text2.replace(/\{stats\.status === 'APPROVED' \? \(/g, '{stats && stats.status === \'APPROVED\' ? (');
fs.writeFileSync('app/ustoz/page.tsx', text2);
