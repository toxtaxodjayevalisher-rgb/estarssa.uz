const fs = require('fs');

// 1. Fix API
let apiCode = fs.readFileSync('app/api/students/route.ts', 'utf8');
apiCode = apiCode.replace(
  /if \(!auth \|\| \(auth\.role !== 'ADMIN' && auth\.role !== 'STARSSA'\)\) \{[\s\S]*?\}/,
  `if (!auth || (auth.role.toUpperCase() !== 'ADMIN' && auth.role.toUpperCase() !== 'STARSSA')) {
    return NextResponse.json({ error: "Ruxsat yo'q: " + JSON.stringify(auth) }, { status: 403 });
  }`
);
fs.writeFileSync('app/api/students/route.ts', apiCode);

// 2. Fix Frontend Starssa
let starssaCode = fs.readFileSync('app/starssa/students/page.tsx', 'utf8');
starssaCode = starssaCode.replace(
  /setShowForm\(false\);\s*\}/,
  `setShowForm(false);
      } else {
        const text = await res.text();
        alert('Xatolik: ' + res.status + ' ' + text);
      }`
);
fs.writeFileSync('app/starssa/students/page.tsx', starssaCode);

// 3. Fix Frontend Admin
let adminCode = fs.readFileSync('app/admin/students/page.tsx', 'utf8');
adminCode = adminCode.replace(
  /setShowForm\(false\);\s*\}/,
  `setShowForm(false);
      } else {
        const text = await res.text();
        alert('Xatolik: ' + res.status + ' ' + text);
      }`
);
fs.writeFileSync('app/admin/students/page.tsx', adminCode);
