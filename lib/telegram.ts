const token = process.env.TELEGRAM_BOT_TOKEN || '8983797302:AAHrMF0yZQ0qOgRGgE96SL6nV5hMKPdD_p4';

export const CHAT_IDS = process.env.TELEGRAM_CHAT_IDS
  ? process.env.TELEGRAM_CHAT_IDS.split(',').map(s => s.trim()).filter(Boolean)
  : ['-1004395732727', '1973751873', '-5459131960'];

export async function sendTelegramMessage(text: string, targetChatIds: string[] = CHAT_IDS) {
  let messageIds = [];
  for (const chatId of targetChatIds) {
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

export async function sendTelegramPhoto(caption: string, photoFile: File, targetChatIds: string[] = CHAT_IDS) {
  let messageIds = [];
  const buffer = await photoFile.arrayBuffer();
  const filename = photoFile.name || 'photo.jpg';
  const fileType = photoFile.type || 'image/jpeg';

  for (const chatId of targetChatIds) {
    try {
      const url = `https://api.telegram.org/bot${token}/sendPhoto`;
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('caption', caption);
      formData.append('parse_mode', 'HTML');
      formData.append('photo', new Blob([buffer], { type: fileType }), filename);

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        console.error(`Rasm yuborishda xato (${chatId}):`, await response.text());
      } else {
        const data = await response.json();
        messageIds.push({ chatId, messageId: data.result.message_id });
      }
    } catch (error) {
      console.error(`Rasm yuborish xatosi (${chatId}):`, error);
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