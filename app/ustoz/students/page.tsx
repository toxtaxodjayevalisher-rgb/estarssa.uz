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
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex justify-center items-center border-b border-slate-700">
          <img src="/icon.png" alt="E-STARSSA" className="h-16 object-contain" />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/ustoz" className="block px-4 py-2 hover:bg-slate-800 rounded">Asosiy</Link>
          <Link href="/ustoz/students" className="block px-4 py-2 bg-blue-600 rounded">O'quvchilar</Link>
          <Link href="/ustoz/approve" className="block px-4 py-2 hover:bg-slate-800 rounded">Tasdiqlash</Link>
          <Link href="/ustoz/history" className="block px-4 py-2 hover:bg-slate-800 rounded">Davomat Tarixi</Link>
        </nav>
      </div>
      <div className="flex-1 p-8 overflow-y-auto text-black relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">O'quvchilar ro'yxati</h1>
        </div>

        {loading ? (
          <p>Yuklanmoqda...</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
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
                {students.length === 0 && <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">O'quvchilar yo'q</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
