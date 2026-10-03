const fs = require('fs');

let code = fs.readFileSync('app/api/attendance/route.ts', 'utf8');

const regex = /body: JSON\.stringify\(\{ chat_id: '1973751873', text: ustozMsg \}\)/;

if (regex.test(code)) {
  code = code.replace(regex, "body: JSON.stringify({ chat_id: '-5459131960', text: ustozMsg })");
  fs.writeFileSync('app/api/attendance/route.ts', code);
  console.log("Updated both messages to go to the group.");
} else {
  console.log("Not found.");
}
