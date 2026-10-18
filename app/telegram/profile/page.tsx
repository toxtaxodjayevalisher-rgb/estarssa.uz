'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { User, Phone, Search, GraduationCap, Users, CheckCircle2, AlertCircle, ArrowLeft, X } from 'lucide-react';

export default function TelegramProfilePage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [person, setPerson] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() && !phone.trim()) {
      setError("Iltimos, F.I.SH yoki telefon raqamingizni kiriting!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/telegram/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Ma'lumot topilmadi. Qaytadan tekshirib ko'ring.");
        setPerson(null);
      } else {
        setPerson(data.person);
        setError(null);
      }
    } catch (err: any) {
      setError("Internet yoki server bilan bog'lanishda xatolik yuz berdi.");
      setPerson(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.close();
    }
  };

  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />

      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col justify-between p-4 sm:p-6">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌟</span>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">E-STARSSA</h1>
                <p className="text-xs text-indigo-300">Profil va guruhni aniqlash</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!person ? (
            /* Search Form */
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-2xl space-y-4">
              <div className="text-center space-y-1">
                <h2 className="text-base font-semibold text-white">Ma'lumotlaringizni kiriting</h2>
                <p className="text-xs text-slate-300">
                  F.I.SH yoki telefon raqamingiz orqali qaysi guruhda o'qishingiz va rolingizni bilib oling.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSearch} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    F.I.SH (Familiya, Ism)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masalan: Abdurahimova Zebo"
                      className="w-full bg-slate-800/80 border border-white/15 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Telefon raqam
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="w-full bg-slate-800/80 border border-white/15 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Tekshirish</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Results Card */
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-white leading-tight">
                  {person.full_name}
                </h2>
                <p className="text-xs text-emerald-400 font-medium">Tizimda muvaffaqiyatli aniqlandi</p>
              </div>

              <div className="bg-slate-800/60 rounded-xl p-4 divide-y divide-white/10 space-y-3">
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2 text-slate-300 text-xs">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>Guruh</span>
                  </div>
                  <span className="text-sm font-bold bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 px-3 py-1 rounded-lg">
                    {person.group_name}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-slate-300 text-xs">
                    <GraduationCap className="w-4 h-4 text-purple-400" />
                    <span>Roli</span>
                  </div>
                  <span className="text-sm font-semibold text-purple-300">
                    {person.role}
                  </span>
                </div>

                {person.phone && (
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2 text-slate-300 text-xs">
                      <Phone className="w-4 h-4 text-cyan-400" />
                      <span>Telefon</span>
                    </div>
                    <span className="text-xs font-mono text-slate-200">
                      {person.phone}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3">
                  <span className="text-slate-300 text-xs">Holati</span>
                  <span className="text-xs text-emerald-300 flex items-center gap-1 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                    Faol
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => { setPerson(null); setFullName(''); setPhone(''); }}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-slate-200 font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Boshqa o'quvchini qidirish</span>
                </button>

                <a
                  href="/login"
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md"
                >
                  <span>🌐</span>
                  <span>Tizimga kirish (Sayt)</span>
                </a>

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Oynani yopish</span>
                </button>
              </div>
            </div>
          )}

          <div className="text-center pt-2">
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white underline underline-offset-4"
            >
              <span>🌐</span>
              <span>Saytga to'g'ridan-to'g'ri kirish (Login)</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-3 text-[11px] text-slate-400 border-t border-white/5 mt-4">
          <p>© 2026 E-STARSSA. Barcha huquqlar himoyalangan.</p>
        </div>
      </main>
    </>
  );
}
