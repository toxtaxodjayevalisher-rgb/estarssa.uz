"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AdminAttendance() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kutilayotganlarni hammasini va arxivlanganlarni oladigan API kerak,
    // Hozircha mavjud /api/attendance/approve ni ishlatib, kelgan ma'lumotni ko'rsatamiz.
    // Aslida Admin hamma davomatlarni ko'rishga haqli.
    fetch('/api/attendance/approve').then(r => r.json()).then(data => {
      setSessions(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-[#0a1128] text-white shadow-2xl z-10 flex flex-col">
        <div className="p-6 text-3xl font-serif font-bold border-b border-slate-700 text-center tracking-wider text-white" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.4)' }}>E-STARSSA</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Asosiy</Link>
          <Link href="/admin/students" className="block px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">O'quvchilar</Link>
          <Link href="/admin/attendance" className="block px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all transform hover:scale-[1.02]">Davomat</Link>
        </nav>
      </div>
      <div className="flex-1 p-8 overflow-y-auto text-black">
        <h1 className="text-3xl font-bold mb-6">Barcha Davomatlar</h1>
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden p-6">
           <p className="text-gray-500 mb-4">Bu sahifada tizimga kiritilgan barcha davomatlar ro'yxati chiqadi.</p>
           {loading ? <p>Yuklanmoqda...</p> : sessions.length === 0 ? (
             <p className="text-gray-500 font-medium">Davomatlar topilmadi.</p>
           ) : (
             <table className="min-w-full text-sm mt-4 border">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left px-4 py-3">Sana</th>
                  <th className="text-left px-4 py-3">Guruh</th>
                  <th className="text-left px-4 py-3">Holati</th>
                  <th className="text-left px-4 py-3">Jami o'quvchilar</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id} className="border-b">
                    <td className="px-4 py-3">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{s.group_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-white text-xs ${s.status === 'APPROVED' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{s.records?.length || 0} ta</td>
                  </tr>
                ))}
              </tbody>
             </table>
           )}
        </div>
      </div>
    </div>
  );
}
