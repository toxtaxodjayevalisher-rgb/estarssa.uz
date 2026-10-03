const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./app/api', function(filePath) {
  if (filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/'Ruxsat yo'q'/g, '"Ruxsat yo\\'q"');
    content = content.replace(/'To'liq ma'lumot kiriting'/g, '"To\\'liq ma\\'lumot kiriting"');
    fs.writeFileSync(filePath, content);
  }
});
