const fs = require('fs');

let content = fs.readFileSync('app/layout.tsx', 'utf8');

// replace body tag
content = content.replace(
  '<body className="min-h-full flex flex-col">{children}</body>',
  '<body className="min-h-full flex flex-col font-sans text-slate-800 bg-gray-50">{children}</body>'
);

// also let's just make sure html tag is set up for sans
content = content.replace(
  'className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}',
  'className={`${geistSans.variable} ${geistMono.variable} h-full antialiased font-sans`}'
);

fs.writeFileSync('app/layout.tsx', content);
console.log('Fixed body in app/layout.tsx');
