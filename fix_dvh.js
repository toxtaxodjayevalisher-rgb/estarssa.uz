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

walk('./app', function(err, results) {
  if (err) throw err;
  results.filter(f => f.endsWith('.tsx')).forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let replaced = content.replace(/flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden/g, 'flex flex-col md:flex-row h-[100dvh] bg-slate-50 overflow-hidden');
    if (content !== replaced) {
      fs.writeFileSync(file, replaced);
      console.log('Fixed dvh in', file);
    }
  });
});
