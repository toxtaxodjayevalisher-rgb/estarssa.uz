const token = process.env.TELEGRAM_BOT_TOKEN || '8983797302:AAHrMF0yZQ0qOgRGgE96SL6nV5hMKPdD_p4';

const CHAT_IDS = ['1973751873', '-5459131960'];

export async function sendTelegramMessage(text: string) {
  let messageIds = [];
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
        console.error(`Xabar yuborishda xato (${chatId}):`, await response.text());
      } else {
        const data = await response.json();
        messageIds.push({ chatId, messageId: data.result.message_id });
      }
    } catch (error) {
      console.error(`Xabar yuborishda xato (${chatId}):`, error);
    }
  }
  return messageIds;
}

export async function sendTelegramPhoto(caption: string, photoFile: File) {
  let messageIds = [];
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
      } else {
        const data = await response.json();
        messageIds.push({ chatId, messageId: data.result.message_id });
      }
    } catch (error) {
      console.error('Rasm yuborish xatosi:', error);
    }
  }
  return messageIds;
}

export async function deleteTelegramMessage(chatId: string, messageId: number) {
  try {
    const url = `https://api.telegram.org/bot${token}/deleteMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId })
    });
  } catch (error) {
    console.error('Xabarni ochirishda xato:', error);
  }
}