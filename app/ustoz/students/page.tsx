"use client";
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';

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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setStudents(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = students.filter(s => 
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.group_name && s.group_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout role="USTOZ">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>👥</span> O'quvchilar ro'yxati
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Guruhdagi o'quvchilar ro'yxati va umumiy davomat statistikasi ({students.length} ta o'quvchi)
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-5">
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="F.I.SH. yoki guruh bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500 font-medium flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span>O'quvchilar yuklanmoqda...</span>
          </div>
        ) : (
          <div>
            {/* Mobile Card List (< md) */}
            <div className="md:hidden space-y-3 pb-8">
              {filtered.map((s, idx) => {
                const kech = s.attendances?.filter(a => a.status === 'KECHIKIB_KELDI').length || 0;
                const sababsiz = s.attendances?.filter(a => a.status === 'KELMADI').length || 0;
                const sababli = s.attendances?.filter(a => a.status === 'UZR_LI').length || 0;

                return (
                  <div key={s.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 font-extrabold text-xs">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug truncate">
                            {s.full_name}
                          </h3>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                            {s.group_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats pills */}
                    <div className="grid grid-cols-3 gap-2 my-3 pt-2.5 border-t border-slate-100 text-center">
                      <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2">
                        <span className="text-[10px] font-bold text-amber-700 block">Kech qolgan</span>
                        <span className="text-sm font-extrabold text-amber-800">{kech} ta</span>
                      </div>
                      <div className="bg-rose-50/70 border border-rose-200/60 rounded-xl p-2">
                        <span className="text-[10px] font-bold text-rose-700 block">Sababsiz</span>
                        <span className="text-sm font-extrabold text-rose-800">{sababsiz} ta</span>
                      </div>
                      <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-2">
                        <span className="text-[10px] font-bold text-blue-700 block">Sababli</span>
                        <span className="text-sm font-extrabold text-blue-800">{sababli} ta</span>
                      </div>
                    </div>

                    {/* Phone and Birth date */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div>
                        {s.birth_date ? (
                          <span>🎂 {new Date(s.birth_date).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-slate-400">Tug'ilgan sana yo'q</span>
                        )}
                      </div>
                      <div>
                        {s.phone ? (
                          <a 
                            href={`tel:${s.phone.replace(/\s/g, '')}`} 
                            className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg inline-flex items-center gap-1 active:scale-95"
                          >
                            📞 {s.phone}
                          </a>
                        ) : (
                          <span className="text-slate-400">Telefon yo'q</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="bg-white p-8 rounded-2xl text-center text-slate-400 font-medium border border-slate-200">
                  O'quvchi topilmadi
                </div>
              )}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
              <div className="overflow-x-auto w-full">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-5 py-3.5 font-bold text-slate-600 uppercase text-xs w-12">#</th>
                      <th className="text-left px-5 py-3.5 font-bold text-slate-600 uppercase text-xs">F.I.SH.</th>
                      <th className="text-left px-5 py-3.5 font-bold text-slate-600 uppercase text-xs">Guruh</th>
                      <th className="text-left px-5 py-3.5 font-bold text-slate-600 uppercase text-xs">Tug'ilgan sana</th>
                      <th className="text-left px-5 py-3.5 font-bold text-slate-600 uppercase text-xs">Telefon</th>
                      <th className="text-center px-4 py-3.5 font-bold text-slate-600 uppercase text-xs">Kech</th>
                      <th className="text-center px-4 py-3.5 font-bold text-slate-600 uppercase text-xs">Sababsiz</th>
                      <th className="text-center px-4 py-3.5 font-bold text-slate-600 uppercase text-xs">Sababli</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((s, idx) => {
                      const kech = s.attendances?.filter(a => a.status === 'KECHIKIB_KELDI').length || 0;
                      const sababsiz = s.attendances?.filter(a => a.status === 'KELMADI').length || 0;
                      const sababli = s.attendances?.filter(a => a.status === 'UZR_LI').length || 0;

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5 text-slate-400 font-bold text-xs">{idx + 1}</td>
                          <td className="px-5 py-3.5 font-bold text-slate-900">{s.full_name}</td>
                          <td className="px-5 py-3.5">
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md text-xs">
                              {s.group_name}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 text-xs">
                            {s.birth_date ? new Date(s.birth_date).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-5 py-3.5">
                            {s.phone ? (
                              <a href={`tel:${s.phone.replace(/\s/g, '')}`} className="text-blue-600 hover:underline font-medium text-xs">
                                {s.phone}
                              </a>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center font-bold text-amber-600 text-xs">{kech}</td>
                          <td className="px-4 py-3.5 text-center font-bold text-rose-600 text-xs">{sababsiz}</td>
                          <td className="px-4 py-3.5 text-center font-bold text-emerald-600 text-xs">{sababli}</td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-medium">
                          O'quvchilar yo'q
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
