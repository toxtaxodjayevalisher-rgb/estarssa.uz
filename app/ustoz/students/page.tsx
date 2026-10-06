"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

type Attendance = { status: string, note: string | null };
type Student = { 
  id: string, 
  full_name: string, 
  group_name: string, 
  phone: string | null, 
  birth_date: string | null,
  attendances: Attendance[] 
};

export default function UstozStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then(data => {
      setStudents(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-slate-50 overflow-hidden">
      <div className="w-full md:w-64 bg-[#0a1128] text-white shadow-2xl z-20 flex flex-col flex-shrink-0">
        <div className="p-6 text-3xl font-serif font-bold border-b border-slate-700 text-center tracking-wider text-white" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.4)' }}>E-STARSSA</div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-3 md:p-4 space-x-2 md:space-x-0 md:space-y-2 border-b md:border-none border-slate-800">
          <Link href="/ustoz" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Asosiy</Link>
          <Link href="/ustoz/students" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all transform hover:scale-[1.02]">O'quvchilar</Link>
          <Link href="/ustoz/approve" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Tasdiqlash</Link>
          <Link href="/ustoz/history" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Davomat Tarixi</Link>
        
          <Link href="/ustoz/announcements" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">E'lonlar</Link>
        </nav>
      </div>
      <div className="flex-1 p-4 md:p-8 overflow-y-auto text-black relative w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">O'quvchilar ro'yxati</h1>
        </div>

        {loading ? (
          <p>Yuklanmoqda...</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden">
            <div className="overflow-x-auto w-full">
<table className="min-w-full text-sm whitespace-nowrap md:whitespace-normal">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase w-16">#</th>
                          <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">F.I.SH.</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Guruh</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Tug'ilgan sana</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Telefon</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Kech qolgan</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Sababsiz yo'q</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Sababli yo'q</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map(s => {
                  const kech = s.attendances?.filter(a => a.status === 'KECHIKIB_KELDI').length || 0;
                  const sababsiz = s.attendances?.filter(a => a.status === 'KELMADI').length || 0;
                  const sababli = s.attendances?.filter(a => a.status === 'UZR_LI').length || 0;

                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{s.full_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{s.group_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{s.birth_date ? new Date(s.birth_date).toLocaleDateString() : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {s.phone ? <a href={`tel:${s.phone.replace(/\s/g, '')}`} className="text-blue-600 hover:underline font-medium">{s.phone}</a> : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-yellow-600 font-bold">{kech}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-red-600 font-bold">{sababsiz}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">{sababli}</td>
                    </tr>
                  )
                })}
                {students.length === 0 && <tr><td colSpan={8} className="px-6 py-4 text-center text-gray-500">O'quvchilar yo'q</td></tr>}
              </tbody>
            </table>
</div>
          </div>
        )}
      </div>
    </div>
  );
}
