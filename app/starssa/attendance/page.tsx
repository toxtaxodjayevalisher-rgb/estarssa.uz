"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

type Student = { id: string, full_name: string, group_name: string };
type AttendanceStatus = 'KELDI' | 'KECHIKIB_KELDI' | 'KELMADI';
type AttendanceRecord = { status: AttendanceStatus, note?: string };

export default function StarssaAttendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then(data => {
      setStudents(data);
      const init: Record<string, AttendanceRecord> = {};
      data.forEach((s: Student) => init[s.id] = { status: 'KELDI' });
      setAttendance(init);
      setLoading(false);
    });
  }, []);

  const handleStatusChange = (id: string, status: AttendanceStatus) => {
    setAttendance(prev => {
      let newNote = prev[id]?.note;
      if (status === 'KECHIKIB_KELDI') {
        newNote = newNote || new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      } else if (status === 'KELMADI') {
        newNote = newNote || '';
      } else {
        newNote = undefined;
      }
      return { ...prev, [id]: { status, note: newNote } };
    });
  };

  const handleNoteChange = (id: string, note: string) => {
    setAttendance(prev => ({ ...prev, [id]: { ...prev[id], note } }));
  };

  const handleSubmit = async () => {
    const records = Object.entries(attendance).map(([student_id, data]) => ({
      student_id,
      status: data.status,
      note: data.status === 'KELMADI' ? (data.note?.trim() || 'Sababsiz') : (data.status === 'KECHIKIB_KELDI' ? data.note : null)
    }));
    
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: new Date().toISOString(),
        group_name: 'Barchasi',
        records,
        submit: true
      })
    });
    if (res.ok) {
      alert("Davomat muvaffaqiyatli Ustozga yuborildi!");
      window.location.href = "/starssa";
    } else {
      const data = await res.json();
      alert("Xatolik yuz berdi: " + (data.error || "Noma'lum xato"));
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-slate-50 overflow-hidden">
      <div className="w-full md:w-64 bg-[#0a1128] text-white shadow-2xl z-20 flex flex-col flex-shrink-0">
        <div className="p-6 text-3xl font-serif font-bold border-b border-slate-700 text-center tracking-wider text-white" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.4)' }}>E-STARSSA</div>
                        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-3 md:p-4 space-x-2 md:space-x-0 md:space-y-2 border-b md:border-none border-slate-800">
          <Link href="/starssa" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Asosiy</Link>
          <Link href="/starssa/students" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">O'quvchilar</Link>
          <Link href="/starssa/attendance" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Davomat Qilish</Link>
          <Link href="/starssa/history" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Davomat Tarixi</Link>
          <Link href="/starssa/homework" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Uyga Vazifa</Link>
        
          <Link href="/starssa/announcements" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">E'lonlar</Link>
        </nav>
      </div>
      <div className="flex-1 p-4 md:p-8 overflow-y-auto text-black relative w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Davomat Qilish</h1>
          <button onClick={handleSubmit} className="bg-green-600 text-white px-6 py-2 rounded font-bold shadow-lg">Tasdiqlash uchun yuborish</button>
        </div>

        {loading ? <p>Yuklanmoqda...</p> : (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden p-4">
            <div className="overflow-x-auto w-full">
<table className="min-w-full text-sm whitespace-nowrap md:whitespace-normal">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 uppercase">O'quvchi</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 uppercase">Holati</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 uppercase">Sababi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap font-medium w-1/3">{s.full_name} <span className="text-gray-400 text-xs ml-2">({s.group_name})</span></td>
                    <td className="px-4 py-4 whitespace-nowrap flex space-x-2">
                      <button 
                        onClick={() => handleStatusChange(s.id, 'KELDI')}
                        className={`px-3 py-1 rounded ${attendance[s.id]?.status === 'KELDI' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                        🟢 Keldi
                      </button>
                      <button 
                        onClick={() => handleStatusChange(s.id, 'KECHIKIB_KELDI')}
                        className={`px-3 py-1 rounded ${attendance[s.id]?.status === 'KECHIKIB_KELDI' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}>
                        🟡 Kechikdi
                      </button>
                      <button 
                        onClick={() => handleStatusChange(s.id, 'KELMADI')}
                        className={`px-3 py-1 rounded ${attendance[s.id]?.status === 'KELMADI' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>
                        🔴 Kelmadi
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap w-1/4">
                      {(attendance[s.id]?.status === 'KELMADI' || attendance[s.id]?.status === 'KECHIKIB_KELDI') && (
                        <input 
                          type={attendance[s.id]?.status === 'KELMADI' ? 'text' : 'time'} placeholder="Sababni yozing..." 
                          className="border p-1 text-sm rounded w-full"
                          value={attendance[s.id]?.note || ''}
                          onChange={(e) => handleNoteChange(s.id, e.target.value)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
</div>
          </div>
        )}
      </div>
    </div>
  );
}
