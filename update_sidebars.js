const fs = require('fs');
const glob = require('glob');

const files = glob.sync('app/starssa/**/*.tsx');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('Davomat Tarixi</Link>')) {
    if (!content.includes('Uyga Vazifa</Link>')) {
      content = content.replace(
        'Davomat Tarixi</Link>',
        'Davomat Tarixi</Link>\n          <Link href="/starssa/homework" className="block px-4 py-2 hover:bg-slate-800 rounded">Uyga Vazifa</Link>'
      );
      fs.writeFileSync(file, content);
      console.log('Updated', file);
    }
  }
});
