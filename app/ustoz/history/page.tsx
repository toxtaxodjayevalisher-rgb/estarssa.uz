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
    fetch('/api/attendance/history').then(r => r.json()).then(data => setSessions(data));
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
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-3xl font-serif font-bold border-b border-slate-700 text-center tracking-wider text-white" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.4)' }}>E-STARSSA</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/ustoz" className="block px-4 py-2 hover:bg-slate-800 rounded">Asosiy</Link>
          <Link href="/ustoz/students" className="block px-4 py-2 hover:bg-slate-800 rounded">O'quvchilar</Link>
          <Link href="/ustoz/approve" className="block px-4 py-2 hover:bg-slate-800 rounded">Tasdiqlash</Link>
          <Link href="/ustoz/history" className="block px-4 py-2 bg-blue-600 rounded">Davomat Tarixi</Link>
        </nav>
      </div>
      <div className="flex-1 p-8 overflow-y-auto text-black">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Davomat Tarixi</h1>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-gray-300 p-2 rounded shadow-sm">
            <option>Barchasi</option>
            <option>Bugun</option>
            <option>Kecha</option>
            <option>Shu hafta</option>
            <option>Shu oy</option>
          </select>
        </div>
        <div className="space-y-6">
          {getFiltered().length === 0 ? (
            <p className="text-gray-500">Hech qanday ma'lumot topilmadi.</p>
          ) : (
            getFiltered().map(session => (
              <div key={session.id} className="bg-white rounded-lg shadow p-6">
                <div className="border-b pb-4 mb-4">
                  <h2 className="text-xl font-bold">Sana: {new Date(session.date).toLocaleDateString()}</h2>
                  <p className="text-gray-600">Guruh: {session.group_name}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div onClick={() => toggleExpand(`${session.id}-keldi`)} className="cursor-pointer bg-green-50 p-3 rounded hover:bg-green-100 transition">
                    <h3 className="font-bold text-green-700 mb-2 flex justify-between">
                      <span>🟢 Kelganlar</span>
                      <span className="bg-green-200 px-2 rounded-full">{session.records.filter((r: any) => r.status === 'KELDI').length}</span>
                    </h3>
                    {expanded[`${session.id}-keldi`] && (
                      <ul className="text-sm mt-2 space-y-1 border-t border-green-200 pt-2">
                        {session.records.filter((r: any) => r.status === 'KELDI').map((r: any) => (
                          <li key={r.id}>{r.student.full_name} {r.note ? `(${r.note})` : ""}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div onClick={() => toggleExpand(`${session.id}-kechikdi`)} className="cursor-pointer bg-yellow-50 p-3 rounded hover:bg-yellow-100 transition">
                    <h3 className="font-bold text-yellow-700 mb-2 flex justify-between">
                      <span>🟡 Kechikkanlar</span>
                      <span className="bg-yellow-200 px-2 rounded-full">{session.records.filter((r: any) => r.status === 'KECHIKIB_KELDI').length}</span>
                    </h3>
                    {expanded[`${session.id}-kechikdi`] && (
                      <ul className="text-sm mt-2 space-y-1 border-t border-yellow-200 pt-2">
                        {session.records.filter((r: any) => r.status === 'KECHIKIB_KELDI').map((r: any) => (
                          <li key={r.id}>{r.student.full_name} {r.note ? `(${r.note})` : ""}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div onClick={() => toggleExpand(`${session.id}-kelmadi`)} className="cursor-pointer bg-red-50 p-3 rounded hover:bg-red-100 transition">
                    <h3 className="font-bold text-red-700 mb-2 flex justify-between">
                      <span>🔴 Kelmaganlar</span>
                      <span className="bg-red-200 px-2 rounded-full">{session.records.filter((r: any) => r.status === 'KELMADI').length}</span>
                    </h3>
                    {expanded[`${session.id}-kelmadi`] && (
                      <ul className="text-sm mt-2 space-y-1 border-t border-red-200 pt-2">
                        {session.records.filter((r: any) => r.status === 'KELMADI').map((r: any) => (
                          <li key={r.id}>{r.student.full_name} {r.note ? `(${r.note})` : ""}</li>
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
