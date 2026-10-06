"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AdminAttendance() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [holidayForm, setHolidayForm] = useState({ date: '', group_name: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [sRes, gRes] = await Promise.all([
      fetch('/api/admin/attendance'),
      fetch('/api/groups')
    ]);
    if (sRes.ok) setSessions(await sRes.json());
    if (gRes.ok) setGroups(await gRes.json());
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Rostdan ham bu davomatni bekor qilib (o'chirib) yubormoqchimisiz?")) return;
    const res = await fetch(\`/api/admin/attendance/\${id}\`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const handleReturn = async (id: string) => {
    if (!confirm("Davomatni Ustozga qaytadan qilish uchun yubormoqchimisiz?")) return;
    const res = await fetch(\`/api/admin/attendance/\${id}\`, { method: 'PUT' });
    if (res.ok) fetchData();
  };

  const handleHolidaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(holidayForm)
    });
    if (res.ok) {
      setShowHolidayForm(false);
      setHolidayForm({ date: '', group_name: '' });
      fetchData();
    } else {
      alert("Xatolik yuz berdi");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <span className="px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full text-xs">Tasdiqlangan</span>;
      case 'SUBMITTED': return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 font-bold rounded-full text-xs">Kutilmoqda</span>;
      case 'DRAFT': return <span className="px-3 py-1 bg-gray-100 text-gray-700 font-bold rounded-full text-xs">Jarayonda</span>;
      case 'HOLIDAY': return <span className="px-3 py-1 bg-purple-100 text-purple-700 font-bold rounded-full text-xs">Bayram / Yopiq</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
      <div className="w-full md:w-64 bg-[#0a1128] text-white shadow-2xl z-20 flex flex-col flex-shrink-0">
        <div className="p-6 text-3xl font-serif font-bold border-b border-slate-700 text-center tracking-wider text-white" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.4)' }}>E-STARSSA</div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-3 md:p-4 space-x-2 md:space-x-0 md:space-y-2 border-b md:border-none border-slate-800">
          <Link href="/admin" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Asosiy</Link>
          <Link href="/admin/students" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">O'quvchilar</Link>
          <Link href="/admin/attendance" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all transform hover:scale-[1.02]">Davomat</Link>
          <Link href="/admin/users" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Akkauntlar</Link>
          <Link href="/admin/announcements" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">E'lonlar</Link>
        </nav>
        <div className="p-4 mt-auto border-t border-slate-800 hidden md:block">
          <Link href="/logout" className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-600 px-4 py-3 rounded-xl text-red-500 hover:text-white font-semibold transition-all group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Chiqish
          </Link>
        </div>
      </div>
      
      <div className="flex-1 p-4 md:p-8 overflow-y-auto text-black relative w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Davomat Nazorati</h1>
          <button onClick={() => setShowHolidayForm(true)} className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-all">+ Bayram qilib yopish</button>
        </div>
        
        {loading ? <p>Yuklanmoqda...</p> : (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 transition-all overflow-hidden">
            <table className="min-w-full block md:table overflow-x-auto whitespace-nowrap md:whitespace-normal text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Sana</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Guruh</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Jo'natuvchi</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Holati</th>
                  <th className="text-right px-6 py-4 font-medium text-gray-500 uppercase">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessions.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold">{s.group_name}</td>
                    <td className="px-6 py-4">{s.created_by?.full_name || 'Noma`lum'}</td>
                    <td className="px-6 py-4">{getStatusBadge(s.status)}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      {s.status !== 'HOLIDAY' && (
                        <button onClick={() => handleReturn(s.id)} className="text-yellow-600 hover:text-yellow-800 font-medium">Qaytarish</button>
                      )}
                      <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800 font-medium">Bekor qilish</button>
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Davomatlar yo'q</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {showHolidayForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-sm transform transition-all">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Bayram kunini belgilash</h2>
              <form onSubmit={handleHolidaySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sana</label>
                  <input type="date" required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" value={holidayForm.date} onChange={e => setHolidayForm({...holidayForm, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guruh</label>
                  <select required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white" value={holidayForm.group_name} onChange={e => setHolidayForm({...holidayForm, group_name: e.target.value})}>
                    <option value="">Tanlang...</option>
                    {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-2">Ushbu kun uchun tanlangan guruh davomati yopiq deb e'lon qilinadi va Starssa ishlashiga hojat qolmaydi.</p>
                <div className="flex justify-end space-x-3 mt-6">
                  <button type="button" onClick={() => setShowHolidayForm(false)} className="px-5 py-2.5 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">Bekor qilish</button>
                  <button type="submit" className="px-5 py-2.5 bg-purple-600 font-medium text-white rounded-xl shadow-lg hover:bg-purple-700 transition-all">Saqlash</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
