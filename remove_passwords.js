const fs = require('fs');

let content = fs.readFileSync('app/admin/users/page.tsx', 'utf8');

// Find the block to remove
const startMarker = '{/* Standart mavjud login va parollar eslatmasi */}';
const endMarker = '{/* Filters */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + content.substring(endIndex);
  fs.writeFileSync('app/admin/users/page.tsx', content);
  console.log('Removed default passwords block from users page');
} else {
  console.log('Could not find markers');
}
