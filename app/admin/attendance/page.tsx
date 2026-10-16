"use client";
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import DashboardLayout from '@/app/components/DashboardLayout';

export default function AdminAttendance() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [holidayForm, setHolidayForm] = useState({ date: '', group_name: '' });
  const [viewSession, setViewSession] = useState<any>(null);

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
    const res = await fetch(`/api/admin/attendance/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const handleReturn = async (id: string) => {
    if (!confirm("Davomatni Ustozga qaytadan qilish uchun yubormoqchimisiz?")) return;
    const res = await fetch(`/api/admin/attendance/${id}`, { method: 'PUT' });
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
      case 'APPROVED': 
        return <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-full text-xs">Tasdiqlangan</span>;
      case 'SUBMITTED': 
      case 'SENT_FOR_APPROVAL':
        return <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 font-bold rounded-full text-xs">Kutilmoqda</span>;
      case 'DRAFT': 
        return <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-full text-xs">Jarayonda</span>;
      case 'HOLIDAY': 
        return <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 border border-purple-200 font-bold rounded-full text-xs">Bayram / Yopiq</span>;
      default: 
        return <span className="text-xs font-semibold">{status}</span>;
    }
  };

  const exportToExcel = () => {
    const data: any[] = [];
    let counter = 1;
    sessions.forEach(s => {
      const dateFormatted = new Date(s.date).toLocaleDateString('uz-UZ');
      if (s.records && s.records.length > 0) {
        s.records.forEach((r: any) => {
          let statusText = 'Keldi';
          if (r.status === 'KECHIKIB_KELDI') statusText = 'Kechikdi';
          else if (r.status === 'UZR_LI' || r.status === 'SABABLI') statusText = 'Sababli';
          else if (r.status === 'KELMADI') statusText = 'Kelmadi';

          data.push({
            '#': counter++,
            'Sana': dateFormatted,
            'Guruh': s.group_name,
            "O'quvchi F.I.SH.": r.student?.full_name || "Noma'lum",
            'Holati': statusText,
            'Izoh / Vaqti': r.note || '-',
            'Tasdiqlash holati': s.status === 'APPROVED' ? 'Tasdiqlangan' : s.status === 'HOLIDAY' ? 'Bayram' : 'Kutilmoqda'
          });
        });
      } else {
         data.push({
            '#': counter++,
            'Sana': dateFormatted,
            'Guruh': s.group_name,
            "O'quvchi F.I.SH.": '-',
            'Holati': s.status === 'HOLIDAY' ? 'Bayram / Dam olish' : s.status,
            'Izoh / Vaqti': '-',
            'Tasdiqlash holati': s.status === 'HOLIDAY' ? 'Bayram' : s.status
         });
      }
    });
    if (data.length === 0) {
      alert("Yuklab olish uchun davomat ma'lumotlari yo'q");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Davomat Hisoboti");
    XLSX.writeFile(workbook, "Davomat_Hisoboti.xlsx");
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>📋</span> Davomat Nazorati
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Barcha guruhlar davomatini tekshirish, qaytarish va Excelga yuklab olish
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={exportToExcel} 
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 flex-1 sm:flex-none text-xs sm:text-sm cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              <span>Excel yuklab olish</span>
            </button>
            <button 
              onClick={() => setShowHolidayForm(true)} 
              className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-purple-600/20 transition flex-1 sm:flex-none text-xs sm:text-sm cursor-pointer"
            >
              + Bayram
            </button>
          </div>
        </div>
      
        {loading ? (
          <div className="p-16 text-center text-slate-500 font-medium flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Davomatlar yuklanmoqda...</span>
          </div>
        ) : (
          <div>
            {/* Mobile Card List (< md) */}
            <div className="md:hidden space-y-3">
              {sessions.map(s => (
                <div key={s.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base" suppressHydrationWarning>
                        {new Date(s.date).toLocaleDateString('uz-UZ')}
                      </h3>
                      <p className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                        👥 Guruh: {s.group_name}
                      </p>
                    </div>
                    <div>
                      {getStatusBadge(s.status)}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-3">
                    Jo'natuvchi: <span className="font-semibold text-slate-700">{s.created_by?.full_name || "Noma'lum"}</span>
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                    <button 
                      onClick={() => setViewSession(s)} 
                      className="py-2 px-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 active:scale-95 rounded-xl transition text-center cursor-pointer"
                    >
                      👁️ Ko'rish
                    </button>
                    {s.status !== 'HOLIDAY' ? (
                      <button 
                        onClick={() => handleReturn(s.id)} 
                        className="py-2 px-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 active:scale-95 rounded-xl transition text-center cursor-pointer"
                      >
                        ↺ Qaytarish
                      </button>
                    ) : (
                      <div></div>
                    )}
                    <button 
                      onClick={() => handleDelete(s.id)} 
                      className="py-2 px-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 active:scale-95 rounded-xl transition text-center cursor-pointer"
                    >
                      🗑️ Bekor
                    </button>
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="bg-white p-8 rounded-2xl text-center text-slate-400 font-medium border border-slate-200">
                  Davomatlar yo'q
                </div>
              )}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-4 font-bold text-slate-600 uppercase text-xs">Sana</th>
                      <th className="text-left px-6 py-4 font-bold text-slate-600 uppercase text-xs">Guruh</th>
                      <th className="text-left px-6 py-4 font-bold text-slate-600 uppercase text-xs">Jo'natuvchi</th>
                      <th className="text-left px-6 py-4 font-bold text-slate-600 uppercase text-xs">Holati</th>
                      <th className="text-right px-6 py-4 font-bold text-slate-600 uppercase text-xs">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sessions.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900" suppressHydrationWarning>
                          {new Date(s.date).toLocaleDateString('uz-UZ')}
                        </td>
                        <td className="px-6 py-4 font-bold text-blue-600">{s.group_name}</td>
                        <td className="px-6 py-4 text-slate-600 text-xs">{s.created_by?.full_name || "Noma'lum"}</td>
                        <td className="px-6 py-4">{getStatusBadge(s.status)}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => setViewSession(s)} 
                            className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            Ko'rish
                          </button>
                          {s.status !== 'HOLIDAY' && (
                            <button 
                              onClick={() => handleReturn(s.id)} 
                              className="text-amber-600 hover:text-amber-800 font-bold text-xs bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              Qaytarish
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(s.id)} 
                            className="text-rose-600 hover:text-rose-800 font-bold text-xs bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            Bekor qilish
                          </button>
                        </td>
                      </tr>
                    ))}
                    {sessions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                          Davomatlar yo'q
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Holiday Modal */}
        {showHolidayForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-900 mb-4">Bayram kunini belgilash</h2>
              <form onSubmit={handleHolidaySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Sana</label>
                  <input type="date" required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none text-sm" value={holidayForm.date} onChange={e => setHolidayForm({...holidayForm, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Guruh</label>
                  <select required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none text-sm" value={holidayForm.group_name} onChange={e => setHolidayForm({...holidayForm, group_name: e.target.value})}>
                    <option value="">Tanlang...</option>
                    {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                  </select>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Ushbu kun uchun tanlangan guruh davomati yopiq deb e'lon qilinadi va Starssa ishlashiga hojat qolmaydi.</p>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowHolidayForm(false)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-sm cursor-pointer">Bekor qilish</button>
                  <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm shadow-md shadow-purple-600/20 active:scale-95 transition cursor-pointer">Saqlash</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {viewSession && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100">
              <div className="flex justify-between items-start mb-5 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{viewSession.group_name} guruhi davomati</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5" suppressHydrationWarning>
                    Sana: {new Date(viewSession.date).toLocaleDateString('uz-UZ')}
                  </p>
                </div>
                <button onClick={() => setViewSession(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer">
                  ✕
                </button>
              </div>
              
              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">O'quvchi F.I.SH.</th>
                      <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Holati</th>
                      <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Izoh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {viewSession.records?.map((r: any) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 font-bold text-slate-800 text-sm">{r.student?.full_name}</td>
                        <td className="px-4 py-3">
                          {r.status === 'KELDI' && <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs">Keldi</span>}
                          {r.status === 'KECHIKIB_KELDI' && <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-full text-xs">Kechikdi</span>}
                          {(r.status === 'UZR_LI' || r.status === 'SABABLI') && <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-full text-xs">Sababli</span>}
                          {r.status === 'KELMADI' && <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-full text-xs">Kelmadi</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{r.note || '-'}</td>
                      </tr>
                    ))}
                    {(!viewSession.records || viewSession.records.length === 0) && (
                      <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400">Bu davomat bo'yicha ma'lumot yo'q (yoki Bayram)</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button onClick={() => setViewSession(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition cursor-pointer">Yopish</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
