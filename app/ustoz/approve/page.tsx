"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';

export default function UstozApprove() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/attendance/approve')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setSessions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleAction = async (session_id: string, action: 'approve' | 'reject' | 'redo') => {
    const res = await fetch('/api/attendance/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id, action })
    });
    if (res.ok) {
      if (action === 'approve') alert('Davomat tasdiqlandi!');
      if (action === 'redo') alert('Davomat qayta qilinishi uchun Starssaga qaytarildi!');
      if (action === 'reject') alert('Davomat butunlay bekor qilindi!');
      
      setSessions(sessions.filter(s => s.id !== session_id));
    } else {
      const text = await res.text();
      alert('Xatolik: ' + text);
    }
  };

  return (
    <DashboardLayout role="USTOZ" pendingBadge={sessions.length}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>📋</span> Tasdiqlash Kutilayotgan Davomatlar
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Starssa tomonidan yuborilgan kunlik davomatlarni tekshirish va tasdiqlash</p>
          </div>
          {sessions.length > 0 && (
            <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full">
              {sessions.length} ta tasdiqlash kutilmoqda
            </span>
          )}
        </div>

        {loading ? (
          <p className="text-gray-500 font-medium">Yuklanmoqda...</p>
        ) : sessions.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center text-gray-500">
            Hozircha tasdiqlanadigan davomat yo'q.
          </div>
        ) : (
          sessions.map(session => (
            <div key={session.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 p-4 sm:p-6 transition-all hover:shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                    Sana: <span suppressHydrationWarning>{new Date(session.date).toLocaleDateString('uz-UZ')}</span>
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">Guruh: <span className="font-semibold text-blue-600">{session.group_name}</span></p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => handleAction(session.id, 'approve')} 
                    className="flex-1 sm:flex-none bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
                  >
                    ✓ Tasdiqlash
                  </button>
                  <button 
                    onClick={() => handleAction(session.id, 'redo')} 
                    className="flex-1 sm:flex-none bg-amber-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-amber-600 active:scale-95 transition-all cursor-pointer"
                  >
                    ↺ Qayta qilish
                  </button>
                  <button 
                    onClick={() => handleAction(session.id, 'reject')} 
                    className="flex-1 sm:flex-none bg-rose-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
                  >
                    ✕ Bekor qilish
                  </button>
                </div>
              </div>

              {/* Attendance categories */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Keldi */}
                <div onClick={() => toggleExpand(`${session.id}-keldi`)} className="cursor-pointer bg-emerald-50 border border-emerald-200 p-3 rounded-xl hover:bg-emerald-100/70 transition">
                  <h3 className="font-bold text-xs sm:text-sm text-emerald-800 mb-1 flex justify-between items-center">
                    <span>🟢 Kelganlar</span>
                    <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full text-xs font-bold">
                      {session.records.filter((r: any) => r.status === 'KELDI').length}
                    </span>
                  </h3>
                  {expanded[`${session.id}-keldi`] && (
                    <ul className="text-xs mt-2 space-y-1 border-t border-emerald-200/60 pt-2 text-emerald-950">
                      {session.records.filter((r: any) => r.status === 'KELDI').map((r: any) => (
                        <li key={r.id} className="truncate">• {r.student?.full_name}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Kechikdi */}
                <div onClick={() => toggleExpand(`${session.id}-kechikdi`)} className="cursor-pointer bg-amber-50 border border-amber-200 p-3 rounded-xl hover:bg-amber-100/70 transition">
                  <h3 className="font-bold text-xs sm:text-sm text-amber-800 mb-1 flex justify-between items-center">
                    <span>🟡 Kechikkanlar</span>
                    <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full text-xs font-bold">
                      {session.records.filter((r: any) => r.status === 'KECHIKIB_KELDI').length}
                    </span>
                  </h3>
                  {expanded[`${session.id}-kechikdi`] && (
                    <ul className="text-xs mt-2 space-y-1 border-t border-amber-200/60 pt-2 text-amber-950">
                      {session.records.filter((r: any) => r.status === 'KECHIKIB_KELDI').map((r: any) => (
                        <li key={r.id}>• {r.student?.full_name} {r.note ? `(${r.note})` : ""}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Sababli */}
                <div onClick={() => toggleExpand(`${session.id}-uzrli`)} className="cursor-pointer bg-blue-50 border border-blue-200 p-3 rounded-xl hover:bg-blue-100/70 transition">
                  <h3 className="font-bold text-xs sm:text-sm text-blue-800 mb-1 flex justify-between items-center">
                    <span>🔵 Sababli</span>
                    <span className="bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full text-xs font-bold">
                      {session.records.filter((r: any) => r.status === 'UZR_LI').length}
                    </span>
                  </h3>
                  {expanded[`${session.id}-uzrli`] && (
                    <ul className="text-xs mt-2 space-y-1 border-t border-blue-200/60 pt-2 text-blue-950">
                      {session.records.filter((r: any) => r.status === 'UZR_LI').map((r: any) => (
                        <li key={r.id}>• {r.student?.full_name} {r.note ? `(${r.note})` : ""}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Kelmadi */}
                <div onClick={() => toggleExpand(`${session.id}-kelmadi`)} className="cursor-pointer bg-rose-50 border border-rose-200 p-3 rounded-xl hover:bg-rose-100/70 transition">
                  <h3 className="font-bold text-xs sm:text-sm text-rose-800 mb-1 flex justify-between items-center">
                    <span>🔴 Kelmaganlar</span>
                    <span className="bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full text-xs font-bold">
                      {session.records.filter((r: any) => r.status === 'KELMADI').length}
                    </span>
                  </h3>
                  {expanded[`${session.id}-kelmadi`] && (
                    <ul className="text-xs mt-2 space-y-1 border-t border-rose-200/60 pt-2 text-rose-950">
                      {session.records.filter((r: any) => r.status === 'KELMADI').map((r: any) => (
                        <li key={r.id}>• {r.student?.full_name} {r.note ? `(${r.note})` : ""}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
