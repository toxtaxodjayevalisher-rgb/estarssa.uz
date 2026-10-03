const fs = require('fs');

let tg = fs.readFileSync('lib/telegram.ts', 'utf8');
if (!tg.includes('sendTelegramPhoto')) {
  tg += `\n\nexport async function sendTelegramPhoto(caption: string, photoFile: File) {
  for (const chatId of CHAT_IDS) {
    try {
      const url = \`https://api.telegram.org/bot\${token}/sendPhoto\`;
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('caption', caption);
      formData.append('parse_mode', 'HTML');
      formData.append('photo', photoFile);

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        console.error('Rasm yuborishda xato:', await response.text());
      }
    } catch (error) {
      console.error('Rasm yuborish xatosi:', error);
    }
  }
}`;
  fs.writeFileSync('lib/telegram.ts', tg);
}

let api = fs.readFileSync('app/api/homework/route.ts', 'utf8');
if (!api.includes('sendTelegramPhoto')) {
  api = api.replace(/import { sendTelegramMessage } from '@\/lib\/telegram';/, "import { sendTelegramMessage, sendTelegramPhoto } from '@/lib/telegram';");
  
  api = api.replace(/await sendTelegramMessage\(tgMsg\);/, `if (image) {
      await sendTelegramPhoto(tgMsg, image);
    } else {
      await sendTelegramMessage(tgMsg);
    }`);
  fs.writeFileSync('app/api/homework/route.ts', api);
}
