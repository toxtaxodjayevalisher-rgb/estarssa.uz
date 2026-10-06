const fs = require('fs');
const glob = require('fs').readdirSync;
const path = require('path');

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
}

walk('./app/admin', function(err, results) {
  if (err) throw err;
  results.filter(f => f.endsWith('.tsx')).forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if the file has the nav block and is missing the ratings link
    if (content.includes('href="/admin/announcements"') && !content.includes('href="/admin/ratings"')) {
      content = content.replace(
        /<Link href="\/admin\/announcements"([^>]*)>(.*?)<\/Link>/g, 
        '<Link href="/admin/announcements"$1>$2</Link>\n            <Link href="/admin/ratings" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Reyting</Link>'
      );
      fs.writeFileSync(file, content);
      console.log('Added ratings link to sidebar in', file);
    }
  });
});
