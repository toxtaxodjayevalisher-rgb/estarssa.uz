"use client";
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';

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
    <DashboardLayout role="USTOZ">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>📜</span> Tasdiqlangan Davomatlar Tarixi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              O'tkazilgan va tasdiqlangan barcha davomat hisobotlari
            </p>
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)} 
            className="border border-slate-200 bg-white px-3.5 py-2 rounded-xl text-sm font-semibold outline-none shadow-xs focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option>Barchasi</option>
            <option>Bugun</option>
            <option>Kecha</option>
            <option>Shu hafta</option>
            <option>Shu oy</option>
          </select>
        </div>

        <div className="space-y-4 pb-8">
          {getFiltered().length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 font-medium">
              Hech qanday ma'lumot topilmadi.
            </div>
          ) : (
            getFiltered().map(session => (
              <div key={session.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 transition-all hover:shadow-md">
                <div className="border-b border-slate-100 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                      Sana: <span suppressHydrationWarning>{new Date(session.date).toLocaleDateString('uz-UZ')}</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Guruh: <span className="font-bold text-blue-600">{session.group_name}</span>
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full w-fit">
                    ✓ Tasdiqlangan
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  {/* Kelganlar */}
                  <div onClick={() => toggleExpand(`${session.id}-keldi`)} className="cursor-pointer bg-emerald-50/70 border border-emerald-200/70 p-3 rounded-xl hover:bg-emerald-100/70 transition">
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
                  <div onClick={() => toggleExpand(`${session.id}-kechikdi`)} className="cursor-pointer bg-amber-50/70 border border-amber-200/70 p-3 rounded-xl hover:bg-amber-100/70 transition">
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
                  <div onClick={() => toggleExpand(`${session.id}-uzrli`)} className="cursor-pointer bg-blue-50/70 border border-blue-200/70 p-3 rounded-xl hover:bg-blue-100/70 transition">
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
                  <div onClick={() => toggleExpand(`${session.id}-kelmadi`)} className="cursor-pointer bg-rose-50/70 border border-rose-200/70 p-3 rounded-xl hover:bg-rose-100/70 transition">
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
    </DashboardLayout>
  );
}
