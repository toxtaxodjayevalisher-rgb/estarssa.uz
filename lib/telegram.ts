const token = process.env.TELEGRAM_BOT_TOKEN || '8983797302:AAHrMF0yZQ0qOgRGgE96SL6nV5hMKPdD_p4';

const CHAT_IDS = ['1973751873', '-5459131960'];

export async function sendTelegramMessage(text: string) {
  for (const chatId of CHAT_IDS) {
    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML'
        })
      });
      
      if (!response.ok) {
        const err = await response.text();
        console.error(`Xabar yuborishda xato (${chatId}):`, err);
      } else {
        console.log(`Xabar yuborildi: ${chatId}`);
      }
    } catch (error) {
      console.error(`Xabar yuborishda xato (${chatId}):`, error);
    }
  }
}


export async function sendTelegramPhoto(caption: string, photoFile: File) {
  for (const chatId of CHAT_IDS) {
    try {
      const url = `https://api.telegram.org/bot${token}/sendPhoto`;
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
}