"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

type Student = { id: string, full_name: string, group_name: string, phone: string | null, birth_date: string | null };

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', group_name: '', phone: '', birth_date: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then(data => {
      setStudents(data);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      const newStudent = await res.json();
      setStudents([newStudent, ...students]);
      setShowForm(false);
      setFormData({ full_name: '', group_name: '', phone: '', birth_date: '' });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-[#0a1128] text-white shadow-2xl z-10 flex flex-col">
        <div className="p-6 text-3xl font-serif font-bold border-b border-slate-700 text-center tracking-wider text-white" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.4)' }}>E-STARSSA</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Asosiy</Link>
          <Link href="/admin/students" className="block px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all transform hover:scale-[1.02]">O'quvchilar</Link>
          <Link href="/admin/attendance" className="block px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Davomat</Link>
        </nav>
      </div>
      <div className="flex-1 p-8 overflow-y-auto text-black relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">O'quvchilar ro'yxati</h1>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded">+ O'quvchi qo'shish</button>
        </div>
        
        {loading ? <p>Yuklanmoqda...</p> : (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">F.I.SH.</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Guruh</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Tug'ilgan sana</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Telefon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map(s => (
                  <tr key={s.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{s.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{s.group_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{s.birth_date ? new Date(s.birth_date).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{s.phone || '-'}</td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">O'quvchilar yo'q</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">Yangi o'quvchi</h2>
              <form onSubmit={handleSubmit}>
                <input required placeholder="F.I.SH." className="w-full border p-2 mb-3 rounded" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                <input required placeholder="Guruh (masalan: 101)" className="w-full border p-2 mb-3 rounded" value={formData.group_name} onChange={e => setFormData({...formData, group_name: e.target.value})} />
                <input type="date" placeholder="Tug'ilgan sana" className="w-full border p-2 mb-3 rounded" value={formData.birth_date || ''} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
                <input placeholder="Telefon raqam" className="w-full border p-2 mb-4 rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 bg-gray-200 rounded">Bekor qilish</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Saqlash</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
