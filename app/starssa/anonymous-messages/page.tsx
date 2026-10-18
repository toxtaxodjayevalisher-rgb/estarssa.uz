"use client";
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Send, CheckCircle2, Clock, RefreshCw, MessageSquare, AlertCircle, Shield } from 'lucide-react';

interface AnonMessage {
  id: string;
  sender_name: string;
  group_name: string;
  message: string;
  reply: string | null;
  replied_at: string | null;
  replied_by: string | null;
  status: 'PENDING' | 'REPLIED';
  created_at: string;
}

export default function StarssaAnonymousMessagesPage() {
  const [messages, setMessages] = useState<AnonMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'REPLIED'>('ALL');
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/starssa/anonymous-messages');
      const data = await res.json();
      if (res.ok && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSendReply = async (msgId: string) => {
    const text = replyTexts[msgId];
    if (!text || !text.trim()) {
      setToast({ message: "Iltimos, javob matnini yozing!", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      setSubmittingId(msgId);
      const res = await fetch('/api/starssa/anonymous-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: msgId,
          reply: text.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Javob yuborishda xatolik");
      }

      setToast({ message: "Javob muvaffaqiyatli yuborildi va o'quvchiga yetkazildi!", type: "success" });
      setTimeout(() => setToast(null), 3000);

      // Update local state
      setMessages(prev => prev.map(m => m.id === msgId ? {
        ...m,
        reply: text.trim(),
        status: 'REPLIED',
        replied_at: new Date().toISOString(),
        replied_by: "Starssa"
      } : m));

      setReplyTexts(prev => ({ ...prev, [msgId]: '' }));
    } catch (err: any) {
      setToast({ message: err.message || "Xatolik yuz berdi", type: "error" });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSubmittingId(null);
    }
  };

  const pendingCount = messages.filter(m => m.status === 'PENDING').length;
  const filteredMessages = messages.filter(m => {
    if (filter === 'PENDING') return m.status === 'PENDING';
    if (filter === 'REPLIED') return m.status === 'REPLIED';
    return true;
  });

  return (
    <DashboardLayout role="STARSSA">
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 ${
            toast.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <span>{toast.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">🕵️</span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-slate-900">
                Anonim Xabarlar
              </h1>
            </div>
            <p className="text-sm text-slate-500">
              O'quvchilar tomonidan Telegram bot orqali yuborilgan murojaat va savollar
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto">
            <button
              onClick={fetchMessages}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Yangilash</span>
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="bg-indigo-50/70 border border-indigo-200/70 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-900">
          <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Maxfiylik va anonimlik kafolatlangan</p>
            <p className="text-indigo-700 leading-relaxed">
              O'quvchilarning shaxsi (ismi, telefon raqami, profili) ko'rsatilmaydi. Siz yozgan javob esa Telegram bot orqali bevosita xabar egasiga yetkaziladi.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filter === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Barchasi</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              {messages.length}
            </span>
          </button>

          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Kutilmoqda</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-extrabold animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilter('REPLIED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filter === 'REPLIED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Javob berilgan</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              {messages.filter(m => m.status === 'REPLIED').length}
            </span>
          </button>
        </div>

        {/* Messages List */}
        {loading ? (
          <div className="p-16 text-center text-slate-500 font-medium flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Anonim xabarlar yuklanmoqda...</span>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 font-medium space-y-2">
            <MessageSquare className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="text-base font-bold text-slate-600">Xabarlar mavjud emas</p>
            <p className="text-xs text-slate-400">
              {filter === 'PENDING' 
                ? "Hozirda javob berilishi kerak bo'lgan yangi anonim xabarlar yo'q." 
                : "Hali anonim xabarlar kelib tushmagan."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((msg) => {
              const isPending = msg.status === 'PENDING';
              const createdDate = new Date(msg.created_at).toLocaleString('uz-UZ', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={msg.id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 shadow-xs border transition-all ${
                    isPending 
                      ? 'border-amber-300/80 ring-2 ring-amber-100' 
                      : 'border-slate-200/80'
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                        🕵️
                      </span>
                      <span className="font-bold text-slate-800 text-sm">
                        Anonim o'quvchi
                      </span>
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {msg.group_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{createdDate}</span>
                      </span>

                      {isPending ? (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Javob kutilmoqda
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Javob berilgan
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Message Bubble */}
                  <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 text-slate-800 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                    {msg.message}
                  </div>

                  {/* Reply Section */}
                  {msg.reply ? (
                    <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                        <span className="flex items-center gap-1.5">
                          <span>💬</span>
                          <span>Sizning javobingiz ({msg.replied_by || 'Starssa'}):</span>
                        </span>
                        {msg.replied_at && (
                          <span className="text-[11px] font-normal text-emerald-600">
                            {new Date(msg.replied_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {msg.reply}
                      </p>
                      <p className="text-[11px] text-emerald-700 font-medium pt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Bot orqali o'quvchiga avtomatik yetkazildi</span>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        O'quvchiga javob yozish:
                      </label>
                      <textarea
                        rows={3}
                        value={replyTexts[msg.id] || ''}
                        onChange={(e) => setReplyTexts(prev => ({ ...prev, [msg.id]: e.target.value }))}
                        placeholder="Javobingizni shu yerga yozing..."
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                      />

                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleSendReply(msg.id)}
                          disabled={submittingId === msg.id}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition disabled:opacity-50 shadow-md shadow-blue-600/20 cursor-pointer"
                        >
                          {submittingId === msg.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Yuborilmoqda...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Javob yuborish (Telegramga)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
