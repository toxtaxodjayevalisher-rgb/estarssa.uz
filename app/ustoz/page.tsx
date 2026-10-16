"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import BirthdayBanner from '@/app/components/BirthdayBanner';

type Student = { id: string, full_name: string, group_name: string, phone?: string, birth_date?: string };
type StatsData = {
  keldi: Student[];
  kechikdi: Student[];
  sababli?: Student[];
  kelmadi: Student[];
  status: string;
};

export default function UstozDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [violators, setViolators] = useState<any[]>([]);
  const [selectedViolator, setSelectedViolator] = useState<any | null>(null);
  
  // Pending attendances
  const [pendingSessions, setPendingSessions] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Fast telegram message
  const [fastMsgLoading, setFastMsgLoading] = useState<string | null>(null);
  const [customFastMsg, setCustomFastMsg] = useState('');
  const [fastMsgToast, setFastMsgToast] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Excusing state & notice
  const [excusingId, setExcusingId] = useState<string | null>(null);
  const [modalNotice, setModalNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/attendance/stats').then(r => r.json()).then(data => setStats(data)).catch(() => {});
    fetch('/api/attendance/top-violators').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setViolators(data);
    }).catch(() => {});
    fetch('/api/alerts').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setAlerts(data);
    }).catch(() => {});

    // Fetch pending approval sessions
    fetch('/api/attendance/approve')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setPendingSessions(data);
        setLoadingPending(false);
      })
      .catch(() => setLoadingPending(false));
  }, []);

  const sendFastMsg = async (msg: string, key?: string) => {
    if (!msg.trim()) return;
    setFastMsgLoading(key || msg);
    setFastMsgToast(null);
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg.trim() })
      });
      if (res.ok) {
        setFastMsgToast({ type: 'success', text: "✓ Xabar Telegramga muvaffaqiyatli jo'natildi!" });
        if (key === 'custom') setCustomFastMsg('');
      } else {
        setFastMsgToast({ type: 'error', text: "Xabar yuborishda xatolik yuz berdi" });
      }
    } catch {
      setFastMsgToast({ type: 'error', text: "Aloqa xatosi yuz berdi" });
    } finally {
      setFastMsgLoading(null);
      setTimeout(() => setFastMsgToast(null), 4000);
    }
  };

  const handleDirectApprove = async (sessionId: string) => {
    setApprovingId(sessionId);
    try {
      const res = await fetch('/api/attendance/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, action: 'approve' })
      });
      if (res.ok) {
        setPendingSessions(prev => prev.filter(s => s.id !== sessionId));
        // Refresh today stats
        fetch('/api/attendance/stats').then(r => r.json()).then(data => setStats(data)).catch(() => {});
      } else {
        const text = await res.text();
        alert('Tasdiqlashda xatolik: ' + text);
      }
    } catch (e: any) {
      alert("Xatolik yuz berdi: " + e.message);
    } finally {
      setApprovingId(null);
    }
  };

  const handleExcuse = async (attendanceId: string) => {
    if (!confirm("Haqiqatan ham ushbu qoidabuzarlikni bekor qilib oqlamoqchimisiz?")) return;
    setExcusingId(attendanceId);
    setModalNotice(null);
    try {
      const res = await fetch('/api/attendance/excuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance_id: attendanceId })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setModalNotice("✓ Ushbu qoidabuzarlik oqlandi va uzrli deb topildi!");
        setTimeout(() => setModalNotice(null), 4000);

        // Update modal state
        setSelectedViolator((prev: any) => {
          if (!prev) return null;
          const updatedRecords = prev.records.filter((r: any) => r.id !== attendanceId);
          return {
            ...prev,
            total_violations: Math.max(0, prev.total_violations - 1),
            records: updatedRecords
          };
        });

        // Refresh violators in dashboard
        fetch('/api/attendance/top-violators')
          .then(r => r.json())
          .then(d => {
            if (Array.isArray(d)) setViolators(d);
          })
          .catch(() => {});
      }
    } catch (err: any) {
      alert("Server xatosi: " + err.message);
    } finally {
      setExcusingId(null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-[#0a1128] text-white shadow-2xl z-20 flex flex-col flex-shrink-0">
        <div className="p-6 text-3xl font-serif font-bold border-b border-slate-700 text-center tracking-wider text-white" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.4)' }}>E-STARSSA</div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-3 md:p-4 space-x-2 md:space-x-0 md:space-y-2 border-b md:border-none border-slate-800">
          <Link href="/ustoz" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all transform hover:scale-[1.02]">Asosiy</Link>
          <Link href="/ustoz/students" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">O'quvchilar</Link>
          <Link href="/ustoz/approve" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1 flex items-center justify-between">
            <span>Tasdiqlash</span>
            {pendingSessions.length > 0 && (
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {pendingSessions.length}
              </span>
            )}
          </Link>
          <Link href="/ustoz/history" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Davomat Tarixi</Link>
          <Link href="/ustoz/announcements" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">E'lonlar</Link>
        </nav>
        <div className="p-4 mt-auto border-t border-slate-800 hidden md:block">
          <Link href="/logout" className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-600 px-4 py-3 rounded-xl text-red-500 hover:text-white font-semibold transition-all group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Chiqish
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto text-slate-800 relative w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Ustoz Kabineti</h1>
            <p className="text-sm text-slate-500 mt-1">Dars jarayoni, davomat nazorati va tezkor xabarlar paneli</p>
          </div>
          <div className="text-xs sm:text-sm text-slate-500 font-medium bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm inline-flex items-center gap-2">
            <span>📅</span> {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Tug'ilgan kun tabrigi */}
        <BirthdayBanner />
        
        {/* Bugungi Davomat */}
        {stats && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span>📊</span> Bugungi davomat
              </h2>
              <span className={`px-3 py-1 rounded-full text-white text-xs sm:text-sm font-semibold shadow-sm ${
                stats.status === 'Boshlanmagan' ? 'bg-slate-500' : 
                stats.status === 'DRAFT' ? 'bg-amber-500' : 
                stats.status === 'SENT_FOR_APPROVAL' ? 'bg-blue-600' : 'bg-emerald-600'
              }`}>
                Holati: {
                  stats.status === 'Boshlanmagan' ? 'Qilinmagan' : 
                  stats.status === 'DRAFT' ? "Qayta qilish so'ralgan" : 
                  stats.status === 'SENT_FOR_APPROVAL' ? "Tasdiqlash kutilmoqda" : 'Tasdiqlangan'
                }
              </span>
            </div>

            {stats.status === 'Boshlanmagan' ? (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-500">
                <div className="text-4xl mb-2">⏳</div>
                <p className="text-lg font-semibold text-slate-700">Bugun hali davomat qilinmagan</p>
                <p className="text-sm text-slate-400 mt-1">Starssa tomonidan davomat kiritilishi kutilmoqda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {/* Kelganlar */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md border-l-4 border-emerald-500">
                  <div className="p-5 cursor-pointer flex flex-col" onClick={() => setExpanded(prev => ({ ...prev, keldi: !prev.keldi }))}>
                    <h3 className="text-emerald-700 font-bold mb-1 flex justify-between items-center text-sm">
                      <span>🟢 Kelganlar</span>
                      <span className="text-xs text-slate-400">{expanded.keldi ? '▲' : '▼'}</span>
                    </h3>
                    <p className="text-3xl font-black text-slate-800">{stats.keldi.length} <span className="text-xs text-slate-400 font-normal">ta o'quvchi</span></p>
                  </div>
                  {expanded.keldi && (
                    <div className="px-5 pb-5 border-t border-slate-100 mt-1 pt-3 max-h-48 overflow-y-auto">
                      <ul className="text-sm space-y-1.5">
                        {stats.keldi.map(s => <li key={s.id} className="flex justify-between font-medium text-slate-700"><span>{s.full_name}</span> <span className="text-xs text-slate-400">{s.group_name}</span></li>)}
                        {stats.keldi.length === 0 && <li className="text-slate-400 text-xs">Hech kim yo'q</li>}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Kechikkanlar */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md border-l-4 border-amber-500">
                  <div className="p-5 cursor-pointer flex flex-col" onClick={() => setExpanded(prev => ({ ...prev, kechikdi: !prev.kechikdi }))}>
                    <h3 className="text-amber-700 font-bold mb-1 flex justify-between items-center text-sm">
                      <span>🟡 Kechikkanlar</span>
                      <span className="text-xs text-slate-400">{expanded.kechikdi ? '▲' : '▼'}</span>
                    </h3>
                    <p className="text-3xl font-black text-slate-800">{stats.kechikdi.length} <span className="text-xs text-slate-400 font-normal">ta o'quvchi</span></p>
                  </div>
                  {expanded.kechikdi && (
                    <div className="px-5 pb-5 border-t border-slate-100 mt-1 pt-3 max-h-48 overflow-y-auto">
                      <ul className="text-sm space-y-1.5">
                        {stats.kechikdi.map(s => <li key={s.id} className="flex justify-between font-medium text-slate-700"><span>{s.full_name}</span> <span className="text-xs text-slate-400">{s.group_name}</span></li>)}
                        {stats.kechikdi.length === 0 && <li className="text-slate-400 text-xs">Hech kim yo'q</li>}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Sababli */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md border-l-4 border-blue-500">
                  <div className="p-5 cursor-pointer flex flex-col" onClick={() => setExpanded(prev => ({ ...prev, sababli: !prev.sababli }))}>
                    <h3 className="text-blue-700 font-bold mb-1 flex justify-between items-center text-sm">
                      <span>🔵 Sababli</span>
                      <span className="text-xs text-slate-400">{expanded.sababli ? '▲' : '▼'}</span>
                    </h3>
                    <p className="text-3xl font-black text-slate-800">{(stats.sababli || []).length} <span className="text-xs text-slate-400 font-normal">ta o'quvchi</span></p>
                  </div>
                  {expanded.sababli && (
                    <div className="px-5 pb-5 border-t border-slate-100 mt-1 pt-3 max-h-48 overflow-y-auto">
                      <ul className="text-sm space-y-1.5">
                        {(stats.sababli || []).map(s => <li key={s.id} className="flex justify-between font-medium text-slate-700"><span>{s.full_name}</span> <span className="text-xs text-slate-400">{s.group_name}</span></li>)}
                        {(!stats.sababli || stats.sababli.length === 0) && <li className="text-slate-400 text-xs">Hech kim yo'q</li>}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Kelmaganlar */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md border-l-4 border-rose-500">
                  <div className="p-5 cursor-pointer flex flex-col" onClick={() => setExpanded(prev => ({ ...prev, kelmadi: !prev.kelmadi }))}>
                    <h3 className="text-rose-700 font-bold mb-1 flex justify-between items-center text-sm">
                      <span>🔴 Kelmaganlar</span>
                      <span className="text-xs text-slate-400">{expanded.kelmadi ? '▲' : '▼'}</span>
                    </h3>
                    <p className="text-3xl font-black text-slate-800">{stats.kelmadi.length} <span className="text-xs text-slate-400 font-normal">ta o'quvchi</span></p>
                  </div>
                  {expanded.kelmadi && (
                    <div className="px-5 pb-5 border-t border-slate-100 mt-1 pt-3 max-h-48 overflow-y-auto">
                      <ul className="text-sm space-y-1.5">
                        {stats.kelmadi.map(s => <li key={s.id} className="flex justify-between font-medium text-slate-700"><span>{s.full_name}</span> <span className="text-xs text-slate-400">{s.group_name}</span></li>)}
                        {stats.kelmadi.length === 0 && <li className="text-slate-400 text-xs">Hech kim yo'q</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 1. TASDIQLASH KUTILAYOTGAN DAVOMATLAR */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Tasdiqlash kutilayotgan davomatlar</h2>
                <p className="text-xs sm:text-sm text-slate-500">Starssalar tomonidan tekshirilib tasdiqlash uchun yuborilgan davomatlar</p>
              </div>
            </div>
            {pendingSessions.length > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-extrabold px-3 py-1.5 rounded-full border border-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                {pendingSessions.length} ta kutilmoqda
              </span>
            )}
          </div>

          {loadingPending ? (
            <p className="text-slate-400 text-sm py-4">Tekshirilmoqda...</p>
          ) : pendingSessions.length > 0 ? (
            <div className="space-y-4">
              <div className="grid gap-3">
                {pendingSessions.map(session => (
                  <div key={session.id} className="bg-slate-50 hover:bg-slate-100/80 rounded-xl p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 text-base">
                          📅 {new Date(session.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-md">
                          Guruh: {session.group_name}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600 pt-1">
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          🟢 Kelgan: {session.records?.filter((r: any) => r.status === 'KELDI').length || 0}
                        </span>
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          🟡 Kechikkan: {session.records?.filter((r: any) => r.status === 'KECHIKIB_KELDI').length || 0}
                        </span>
                        <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          🔵 Sababli: {session.records?.filter((r: any) => r.status === 'UZR_LI').length || 0}
                        </span>
                        <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          🔴 Kelmagan: {session.records?.filter((r: any) => r.status === 'KELMADI').length || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        disabled={approvingId === session.id}
                        onClick={() => handleDirectApprove(session.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {approvingId === session.id ? 'Tasdiqlanmoqda...' : '✓ Tezkor Tasdiqlash'}
                      </button>
                      <Link
                        href="/ustoz/approve"
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1"
                      >
                        Batafsil ko'rish ➜
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-right">
                <Link
                  href="/ustoz/approve"
                  className="text-blue-600 hover:text-blue-800 font-bold text-sm inline-flex items-center gap-1 hover:underline"
                >
                  Barcha davomatlarni tasdiqlash bo'limiga o'tish ({pendingSessions.length} ta) →
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 text-xl font-bold">✓</span>
                <span className="text-sm font-medium">Hozirda tasdiqlash kutilayotgan yangi davomatlar yo'q. Barcha hisobotlar qabul qilingan.</span>
              </div>
              <Link
                href="/ustoz/approve"
                className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-1.5 rounded-lg transition"
              >
                Tasdiqlash bo'limi ➜
              </Link>
            </div>
          )}
        </div>

        {/* 2. TEZKOR TELEGRAM XABAR JO'NATISH */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md border-t-4 border-blue-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Tezkor Telegram xabar jo'natish</h2>
                <p className="text-xs sm:text-sm text-slate-500">Guruh kanali va starssalarga bir tugma orqali ogohlantirish yoki xabar jo'nating</p>
              </div>
            </div>
          </div>

          {fastMsgToast && (
            <div className={`p-3.5 rounded-xl mb-4 text-sm font-semibold flex items-center gap-2 transition-all ${
              fastMsgToast.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              <span>{fastMsgToast.type === 'success' ? '✅' : '⚠️'}</span>
              <span>{fastMsgToast.text}</span>
            </div>
          )}

          {/* Preset Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            <button
              disabled={!!fastMsgLoading}
              onClick={() => sendFastMsg("Menga telefon qilib yuboring!", "call")}
              className="bg-blue-50 hover:bg-blue-100/90 text-blue-800 border border-blue-200 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-between shadow-sm active:scale-95 disabled:opacity-50 text-left"
            >
              <span className="flex items-center gap-2">
                <span>📞</span> "Menga telefon qiling"
              </span>
              {fastMsgLoading === 'call' && <span className="text-xs animate-spin">⏳</span>}
            </button>

            <button
              disabled={!!fastMsgLoading}
              onClick={() => sendFastMsg("Bugungi davomat qani? Nega kutilmoqda?", "davomat")}
              className="bg-amber-50 hover:bg-amber-100/90 text-amber-800 border border-amber-200 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-between shadow-sm active:scale-95 disabled:opacity-50 text-left"
            >
              <span className="flex items-center gap-2">
                <span>📋</span> "Bugungi davomat qani?"
              </span>
              {fastMsgLoading === 'davomat' && <span className="text-xs animate-spin">⏳</span>}
            </button>

            <button
              disabled={!!fastMsgLoading}
              onClick={() => sendFastMsg("STARSSA - qayerdasiz, dars vaqtida kutyapmiz!", "warn")}
              className="bg-rose-50 hover:bg-rose-100/90 text-rose-800 border border-rose-200 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-between shadow-sm active:scale-95 disabled:opacity-50 text-left"
            >
              <span className="flex items-center gap-2">
                <span>⚠️</span> "STARSSA - kutyapmiz!"
              </span>
              {fastMsgLoading === 'warn' && <span className="text-xs animate-spin">⏳</span>}
            </button>

            <button
              disabled={!!fastMsgLoading}
              onClick={() => sendFastMsg("Davomatni tezroq yakunlab tasdiqlashga yuboring!", "speedup")}
              className="bg-purple-50 hover:bg-purple-100/90 text-purple-800 border border-purple-200 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-between shadow-sm active:scale-95 disabled:opacity-50 text-left"
            >
              <span className="flex items-center gap-2">
                <span>⏱️</span> "Davomatni tezlashtiring"
              </span>
              {fastMsgLoading === 'speedup' && <span className="text-xs animate-spin">⏳</span>}
            </button>

            <button
              disabled={!!fastMsgLoading}
              onClick={() => sendFastMsg("Dars boshlandi, hamma dars xonasiga kiring!", "class_start")}
              className="bg-emerald-50 hover:bg-emerald-100/90 text-emerald-800 border border-emerald-200 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-between shadow-sm active:scale-95 disabled:opacity-50 text-left"
            >
              <span className="flex items-center gap-2">
                <span>🔔</span> "Dars boshlandi, xonaga!"
              </span>
              {fastMsgLoading === 'class_start' && <span className="text-xs animate-spin">⏳</span>}
            </button>

            <button
              disabled={!!fastMsgLoading}
              onClick={() => sendFastMsg("Uyga vazifalarni tekshirib, yakuniy natijalarni yetkazing!", "hw_check")}
              className="bg-indigo-50 hover:bg-indigo-100/90 text-indigo-800 border border-indigo-200 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-between shadow-sm active:scale-95 disabled:opacity-50 text-left"
            >
              <span className="flex items-center gap-2">
                <span>📝</span> "Uyga vazifani tekshiring"
              </span>
              {fastMsgLoading === 'hw_check' && <span className="text-xs animate-spin">⏳</span>}
            </button>
          </div>

          {/* Custom Message Input */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Yoki o'zingiz ixtiyoriy tezkor xabar yozib jo'nating:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customFastMsg}
                onChange={e => setCustomFastMsg(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && customFastMsg.trim()) sendFastMsg(customFastMsg, 'custom');
                }}
                placeholder="Xabar matnini kiriting (masalan: 10 daqiqadan keyin xonaga yig'ilinglar)..."
                className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
              />
              <button
                disabled={!customFastMsg.trim() || fastMsgLoading === 'custom'}
                onClick={() => sendFastMsg(customFastMsg, 'custom')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 flex-shrink-0"
              >
                {fastMsgLoading === 'custom' ? (
                  <><span>⏳</span> Yuborilmoqda...</>
                ) : (
                  <><span>🚀</span> Yuborish</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 3. ENG KO'P QOIDABUZARLIK QILGANLAR (OXIRGI 1 OY) */}
        {violators.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md border-t-4 border-rose-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚨</span>
                <div>
                  <h2 className="text-xl font-bold text-rose-700">Eng ko'p qoidabuzarlik qilganlar (Oxirgi 1 oy)</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Ko'p dars qoldirgan o'quvchilar ro'yxati. Har bir holatni ko'rish yoki bekor qilish (oqlash) mumkin.</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-rose-50 text-rose-700 px-3 py-1 rounded-full border border-rose-200">
                Top {violators.length} ta o'quvchi
              </span>
            </div>

            <div className="grid gap-3">
              {violators.map((v, index) => {
                const rankStyles = [
                  'bg-gradient-to-r from-amber-500 to-yellow-400 text-white shadow-amber-200',
                  'bg-gradient-to-r from-slate-400 to-slate-300 text-white shadow-slate-200',
                  'bg-gradient-to-r from-amber-700 to-amber-600 text-white shadow-amber-300',
                  'bg-slate-100 text-slate-700',
                  'bg-slate-100 text-slate-700'
                ];
                const rankMedals = ['🥇', '🥈', '🥉', '4', '5'];

                return (
                  <div
                    key={v.student.id}
                    onClick={() => setSelectedViolator(v)}
                    className="group bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all hover:shadow-md hover:border-slate-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0 ${rankStyles[index] || 'bg-slate-100 text-slate-700'}`}>
                        {rankMedals[index] || `#${index + 1}`}
                      </div>
                      <div>
                        <div className="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition">
                          {v.student.full_name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                          <span className="bg-slate-200/80 px-2 py-0.5 rounded text-slate-700 font-semibold">{v.student.group_name}</span>
                          <span>•</span>
                          <span>Tel: {v.student.phone || 'Kiritilmagan'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                      <span className="bg-rose-100 text-rose-700 font-black px-3.5 py-1.5 rounded-xl text-xs sm:text-sm border border-rose-200 flex items-center gap-1.5">
                        <span>⚠️</span> {v.total_violations} marta qoidabuzarlik
                      </span>
                      <button className="bg-white group-hover:bg-blue-600 text-slate-700 group-hover:text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-300 group-hover:border-blue-600 shadow-sm transition flex items-center gap-1">
                        Ko'rish & Oqlash <span className="group-hover:translate-x-0.5 transition-transform">➜</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal: Alerts */}
        {selectedAlert && (
          <div 
            onClick={(e) => { if(e.target === e.currentTarget) setSelectedAlert(null); }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          >
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-slate-100">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <h2 className="text-xl font-bold text-rose-600">Qoidabuzarlik Holati</h2>
                </div>
                <button 
                  onClick={() => setSelectedAlert(null)} 
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold text-lg transition"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <p><strong>O'quvchi:</strong> {selectedAlert.student.full_name}</p>
                <p><strong>Holat:</strong> <span className="text-rose-600 font-semibold">{selectedAlert.reason}</span></p>
              </div>

              <h3 className="font-bold text-slate-800 text-sm mb-2">Tushuntirish xatlari va sabablari:</h3>
              <div className="overflow-y-auto flex-1 mb-4 border border-slate-200 p-3 rounded-2xl bg-slate-50/50">
                <ul className="space-y-2">
                  {selectedAlert.student.attendances.map((r: any) => (
                    <li key={r.id} className="p-3 border border-slate-200 bg-white rounded-xl shadow-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-slate-800">
                          📅 {new Date(r.date).toLocaleDateString('uz-UZ')}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          r.status === 'KELMADI' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.status === 'KELMADI' ? 'Kelmagan' : 'Kechikkan'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600"><strong>Sabab:</strong> {r.note || 'Kiritilmagan'}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-4 border-t border-slate-100">
                <button 
                  onClick={async () => {
                    const res = await fetch('/api/alerts/resolve', { 
                      method: 'POST', 
                      headers: {'Content-Type':'application/json'},
                      body: JSON.stringify({ alert_id: selectedAlert.id, action: 'excuse' })
                    });
                    if(res.ok) {
                      alert("O'quvchi kechirildi va holatlar uzrli deb topildi.");
                      setSelectedAlert(null);
                      fetch('/api/alerts').then(r=>r.json()).then(d=>setAlerts(d));
                    }
                  }} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition active:scale-95 flex-1"
                >
                  ✓ Kechirilsin (Asosli)
                </button>
                <button 
                  onClick={async () => {
                    const res = await fetch('/api/alerts/resolve', { 
                      method: 'POST', 
                      headers: {'Content-Type':'application/json'},
                      body: JSON.stringify({ alert_id: selectedAlert.id, action: 'warn' })
                    });
                    if(res.ok) {
                      alert('Ota-onasi ogohlantirildi!');
                      setSelectedAlert(null);
                      fetch('/api/alerts').then(r=>r.json()).then(d=>setAlerts(d));
                    }
                  }} 
                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition active:scale-95 flex-1"
                >
                  ⚠️ Ogohlantirish (Sababsiz)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Top Violator Details & Excusing */}
        {selectedViolator && (
          <div 
            onClick={(e) => { if(e.target === e.currentTarget) setSelectedViolator(null); }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-slate-100 overflow-hidden">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-slate-900 text-white flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👤</span>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{selectedViolator.student.full_name}</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
                    <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded-md">
                      {selectedViolator.student.group_name}
                    </span>
                    {selectedViolator.student.phone && (
                      <a href={`tel:${selectedViolator.student.phone}`} className="hover:text-white underline font-semibold">
                        📞 {selectedViolator.student.phone}
                      </a>
                    )}
                    {selectedViolator.student.birth_date && (
                      <span>
                        🎂 {new Date(selectedViolator.student.birth_date).toLocaleDateString('uz-UZ')}
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedViolator(null)} 
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-lg transition"
                >
                  ✕
                </button>
              </div>

              {/* Notice Banner */}
              {modalNotice && (
                <div className="mx-6 mt-4 p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <span>✅</span> {modalNotice}
                </div>
              )}

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-800 text-base">
                    Qoidabuzarlik holatlari (Oxirgi 1 oy)
                  </h3>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    Jami: {selectedViolator.records.length} ta
                  </span>
                </div>

                {selectedViolator.records.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="text-4xl mb-2">🎉</div>
                    <h4 className="text-base font-bold text-slate-800">Barcha qoidabuzarliklar oqlandi!</h4>
                    <p className="text-xs text-slate-500 mt-1">Ushbu o'quvchida faol qoidabuzarlik qaydlari qolmadi.</p>
                    <button
                      onClick={() => setSelectedViolator(null)}
                      className="mt-4 bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold"
                    >
                      Yopish
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {selectedViolator.records.map((r: any) => {
                      return (
                        <li key={r.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50 hover:bg-white transition-all shadow-xs">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                              <span>📅</span> {new Date(r.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                              r.status === 'KELMADI' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {r.status === 'KELMADI' ? '🔴 Kelmagan' : '🟡 Kechikkan'}
                            </span>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 mb-3">
                            <span className="font-bold text-slate-900">Sabab / Tushuntirish:</span>{' '}
                            <span className={r.note ? 'text-slate-800' : 'text-slate-400 italic'}>
                              {r.note || "Sabab kiritilmagan"}
                            </span>
                          </div>
                          
                          <div className="flex justify-end">
                            <button 
                              disabled={excusingId === r.id}
                              onClick={() => handleExcuse(r.id)} 
                              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-4 py-2 rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {excusingId === r.id ? (
                                <><span>⏳</span> Oqlanmoqda...</>
                              ) : (
                                <><span>✓</span> Bekor qilish (Oqlash)</>
                              )}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedViolator(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}