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
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex justify-center items-center border-b border-slate-700">
          <img src="/icon.png" alt="E-STARSSA" className="h-16 object-contain" />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block px-4 py-2 hover:bg-slate-800 rounded">Asosiy</Link>
          <Link href="/admin/students" className="block px-4 py-2 hover:bg-slate-800 rounded">O'quvchilar</Link>
          <Link href="/admin/attendance" className="block px-4 py-2 bg-blue-600 rounded">Davomat</Link>
        </nav>
      </div>
      <div className="flex-1 p-8 overflow-y-auto text-black">
        <h1 className="text-3xl font-bold mb-6">Barcha Davomatlar</h1>
        <div className="bg-white rounded-lg shadow overflow-hidden p-6">
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
