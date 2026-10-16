"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

type Session = {
  id: string;
  date: string;
  group_name: string;
  records: any[];
};

export default function UstozHistory() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filter, setFilter] = useState('Barchasi');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/attendance/history')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setSessions(data);
      });
  }, []);

  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const getFiltered = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);

    return sessions.filter(s => {
      const d = new Date(s.date);
      d.setHours(0,0,0,0);
      if (filter === 'Bugun') return d.getTime() === today.getTime();
      if (filter === 'Kecha') return d.getTime() === yesterday.getTime();
      if (filter === 'Shu hafta') return d >= weekAgo;
      if (filter === 'Shu oy') return d >= monthAgo;
      return true;
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-slate-50 overflow-hidden font-sans">
      <div className="w-full md:w-64 bg-[#0a1128] text-white shadow-2xl z-20 flex flex-col flex-shrink-0">
        <div className="p-6 text-2xl font-bold border-b border-slate-700 text-center tracking-wider text-white">E-STARSSA</div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-3 md:p-4 space-x-2 md:space-x-0 md:space-y-2 border-b md:border-none border-slate-800">
          <Link href="/ustoz" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium">Asosiy</Link>
          <Link href="/ustoz/students" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium">O'quvchilar</Link>
          <Link href="/ustoz/approve" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium">Tasdiqlash</Link>
          <Link href="/ustoz/history" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 font-bold text-white">Davomat Tarixi</Link>
          <Link href="/ustoz/announcements" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium">E'lonlar</Link>
        </nav>
        <div className="p-4 mt-auto border-t border-slate-800 hidden md:block">
          <Link href="/logout" className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-600 px-4 py-2.5 rounded-xl text-red-500 hover:text-white font-semibold transition-all">
            Chiqish
          </Link>
        </div>
      </div>
      <div className="flex-1 p-4 md:p-8 overflow-y-auto text-slate-800 relative w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Tasdiqlangan Davomatlar Tarixi</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">O'tkazilgan va tasdiqlangan barcha davomat hisobotlari</p>
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)} 
            className="border border-gray-300 bg-white p-2.5 rounded-xl text-sm font-semibold outline-none shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            <option>Barchasi</option>
            <option>Bugun</option>
            <option>Kecha</option>
            <option>Shu hafta</option>
            <option>Shu oy</option>
          </select>
        </div>

        <div className="space-y-4">
          {getFiltered().length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-slate-100 font-medium">
              Hech qanday ma'lumot topilmadi.
            </div>
          ) : (
            getFiltered().map(session => (
              <div key={session.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 transition-all hover:shadow-md">
                <div className="border-b border-gray-100 pb-3 mb-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Sana: {new Date(session.date).toLocaleDateString('uz-UZ')}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Guruh: <span className="font-semibold text-blue-600">{session.group_name}</span></p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                    ✓ Tasdiqlangan
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Kelganlar */}
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

                  {/* Kechikkanlar */}
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

                  {/* Kelmaganlar */}
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
      </div>
    </div>
  );
}
