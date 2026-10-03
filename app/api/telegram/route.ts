import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(req: Request) {
  const auth = await verifyAuth();
  if (!auth) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  try {
    const { message } = await req.json();
    await sendTelegramMessage(`⚠️ <b>Tezkor Xabar (USTOZ)</b>\n\n💬 ${message}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
