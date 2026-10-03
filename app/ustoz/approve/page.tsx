"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function UstozApprove() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/attendance/approve').then(r => r.json()).then(data => {
      setSessions(data);
      setLoading(false);
    });
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
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-700 text-center">E-STARSSA</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/ustoz" className="block px-4 py-2 hover:bg-slate-800 rounded">Asosiy</Link>
          <Link href="/ustoz/students" className="block px-4 py-2 hover:bg-slate-800 rounded">O'quvchilar</Link>
          <Link href="/ustoz/approve" className="block px-4 py-2 bg-blue-600 rounded">Tasdiqlash</Link>
          <Link href="/ustoz/history" className="block px-4 py-2 hover:bg-slate-800 rounded">Davomat Tarixi</Link>
        </nav>
      </div>
      <div className="flex-1 p-8 overflow-y-auto text-black">
        <h1 className="text-3xl font-bold mb-6">Tasdiqlash Kutayotgan Davomatlar</h1>

        {loading ? <p>Yuklanmoqda...</p> : sessions.length === 0 ? (
          <div className="bg-white p-6 rounded shadow text-center text-gray-500">
            Hozircha tasdiqlanadigan davomat yo'q.
          </div>
        ) : (
          sessions.map(session => (
            <div key={session.id} className="bg-white rounded-lg shadow mb-6 p-6">
              <div className="flex justify-between items-center mb-4 pb-4 border-b">
                <div>
                  <h2 className="text-xl font-bold">Sana: {new Date(session.date).toLocaleDateString()}</h2>
                  <p className="text-gray-600">Guruh: {session.group_name}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleAction(session.id, 'approve')} className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700">Tasdiqlash</button>
                  <button onClick={() => handleAction(session.id, 'redo')} className="bg-yellow-500 text-white px-4 py-2 rounded font-bold hover:bg-yellow-600">Qayta qilish</button>
                  <button onClick={() => handleAction(session.id, 'reject')} className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700">Bekor qilish</button>
                </div>
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
  );
}
