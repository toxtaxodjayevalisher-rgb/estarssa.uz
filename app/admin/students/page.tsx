"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';

type Student = { id: string, full_name: string, group_name: string, phone: string | null, birth_date: string | null };
type Group = { id: string, name: string };

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filterGroup, setFilterGroup] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [groups, setGroups] = useState<Group[]>([]);
  
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  const [studentForm, setStudentForm] = useState({ full_name: '', group_name: '', phone: '', birth_date: '' });
  const [groupForm, setGroupForm] = useState({ name: '' });
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'STUDENTS' | 'GROUPS'>('STUDENTS');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [sRes, gRes] = await Promise.all([
      fetch('/api/students'),
      fetch('/api/groups')
    ]);
    if (sRes.ok) setStudents(await sRes.json());
    if (gRes.ok) setGroups(await gRes.json());
    setLoading(false);
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingStudentId ? `/api/students/${editingStudentId}` : '/api/students';
    const method = editingStudentId ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentForm)
    });
    
    if (res.ok) {
      await fetchData();
      setShowStudentForm(false);
      setEditingStudentId(null);
      setStudentForm({ full_name: '', group_name: '', phone: '', birth_date: '' });
    } else {
      alert("Xatolik yuz berdi");
    }
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingGroupId ? `/api/groups/${editingGroupId}` : '/api/groups';
    const method = editingGroupId ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupForm)
    });
    
    if (res.ok) {
      await fetchData();
      setShowGroupForm(false);
      setEditingGroupId(null);
      setGroupForm({ name: '' });
    } else {
      alert("Xatolik (balki bunday guruh allaqachon mavjud)");
    }
  };

  const deleteStudent = async (id: string) => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
    else alert("O'chirishda xatolik yuz berdi");
  };

  const deleteGroup = async (id: string) => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    const res = await fetch(`/api/groups/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const filteredStudents = students.filter(s => {
    if (filterGroup && s.group_name !== filterGroup) return false;
    if (searchQuery && !s.full_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout role="ADMIN">
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>👥</span> O'quvchilar va Guruhlar
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Guruhlar va o'quvchilar ro'yxatini to'liq boshqarish
            </p>
          </div>
          
          {/* Action button */}
          <div>
            {activeTab === 'STUDENTS' ? (
              <button 
                onClick={() => { 
                  setEditingStudentId(null); 
                  setStudentForm({ full_name: '', group_name: groups[0]?.name || '', phone: '', birth_date: '' }); 
                  setShowStudentForm(true); 
                }} 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                + O'quvchi qo'shish
              </button>
            ) : (
              <button 
                onClick={() => { 
                  setEditingGroupId(null); 
                  setGroupForm({ name: '' }); 
                  setShowGroupForm(true); 
                }} 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                + Yangi guruh
              </button>
            )}
          </div>
        </div>
        
        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('STUDENTS')} 
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${activeTab === 'STUDENTS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            👥 O'quvchilar ({students.length})
          </button>
          <button 
            onClick={() => setActiveTab('GROUPS')} 
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${activeTab === 'GROUPS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            🏫 Guruhlar ({groups.length})
          </button>
        </div>
        
        {loading ? (
          <div className="p-16 text-center text-slate-500 font-medium flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Yuklanmoqda...</span>
          </div>
        ) : (
          <>
            {activeTab === 'STUDENTS' && (
              <div className="space-y-4">
                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      🔍
                    </span>
                    <input
                      type="text"
                      placeholder="F.I.SH. bo'yicha qidirish..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <select
                    value={filterGroup}
                    onChange={(e) => setFilterGroup(e.target.value)}
                    className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">Barcha guruhlar</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* Mobile Card List (< md) */}
                <div className="md:hidden space-y-3">
                  {filteredStudents.map((s, idx) => (
                    <div key={s.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm truncate">{s.full_name}</h3>
                          </div>
                          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-bold text-xs inline-block mt-1">
                            {s.group_name}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 space-y-1 mb-3 pt-2 border-t border-slate-100">
                        <p>🎂 Tug'ilgan sana: <span suppressHydrationWarning>{s.birth_date ? new Date(s.birth_date).toLocaleDateString() : '—'}</span></p>
                        <p>📞 Telefon: {s.phone || '—'}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                        <button 
                          onClick={() => { 
                            setEditingStudentId(s.id); 
                            setStudentForm({ full_name: s.full_name, group_name: s.group_name, phone: s.phone || '', birth_date: s.birth_date ? s.birth_date.split('T')[0] : '' }); 
                            setShowStudentForm(true); 
                          }} 
                          className="py-2 px-3 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 active:scale-95 rounded-xl transition text-center cursor-pointer"
                        >
                          ✏️ Tahrirlash
                        </button>
                        <button 
                          onClick={() => deleteStudent(s.id)} 
                          className="py-2 px-3 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 active:scale-95 rounded-xl transition text-center cursor-pointer"
                        >
                          🗑️ O'chirish
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div className="bg-white p-8 rounded-2xl text-center text-slate-400 font-medium border border-slate-200">
                      O'quvchilar yo'q
                    </div>
                  )}
                </div>

                {/* Desktop Table View (>= md) */}
                <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto w-full">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left px-5 py-3.5 font-bold text-slate-600 uppercase text-xs w-12">#</th>
                          <th className="text-left px-5 py-3.5 font-bold text-slate-600 uppercase text-xs">F.I.SH.</th>
                          <th className="text-left px-5 py-3.5 font-bold text-slate-600 uppercase text-xs">Guruh</th>
                          <th className="text-left px-5 py-3.5 font-bold text-slate-600 uppercase text-xs">Tug'ilgan sana</th>
                          <th className="text-left px-5 py-3.5 font-bold text-slate-600 uppercase text-xs">Telefon</th>
                          <th className="text-right px-5 py-3.5 font-bold text-slate-600 uppercase text-xs">Amallar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStudents.map((s, idx) => (
                          <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-5 py-3.5 text-slate-400 font-bold text-xs">{idx + 1}</td>
                            <td className="px-5 py-3.5 font-bold text-slate-900">{s.full_name}</td>
                            <td className="px-5 py-3.5">
                              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-bold text-xs">
                                {s.group_name}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-600 text-xs" suppressHydrationWarning>
                              {s.birth_date ? new Date(s.birth_date).toLocaleDateString() : '—'}
                            </td>
                            <td className="px-5 py-3.5 text-slate-600 text-xs">{s.phone || '—'}</td>
                            <td className="px-5 py-3.5 text-right space-x-2">
                              <button 
                                onClick={() => { 
                                  setEditingStudentId(s.id); 
                                  setStudentForm({ full_name: s.full_name, group_name: s.group_name, phone: s.phone || '', birth_date: s.birth_date ? s.birth_date.split('T')[0] : '' }); 
                                  setShowStudentForm(true); 
                                }} 
                                className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                              >
                                Tahrirlash
                              </button>
                              <button 
                                onClick={() => deleteStudent(s.id)} 
                                className="text-rose-600 hover:text-rose-800 font-bold text-xs bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                              >
                                O'chirish
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredStudents.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
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

            {activeTab === 'GROUPS' && (
              <div className="space-y-4">
                {/* Mobile Card List for Groups (< md) */}
                <div className="md:hidden space-y-3">
                  {groups.map(g => (
                    <div key={g.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                      <div>
                        <Link href={`/admin/groups/${g.id}`} className="text-blue-600 hover:underline font-bold text-base">
                          {g.name}
                        </Link>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setEditingGroupId(g.id); setGroupForm({ name: g.name }); setShowGroupForm(true); }} 
                          className="text-blue-600 font-bold text-xs bg-blue-50 px-3 py-1.5 rounded-lg"
                        >
                          Tahrirlash
                        </button>
                        <button 
                          onClick={() => deleteGroup(g.id)} 
                          className="text-rose-600 font-bold text-xs bg-rose-50 px-3 py-1.5 rounded-lg"
                        >
                          O'chirish
                        </button>
                      </div>
                    </div>
                  ))}
                  {groups.length === 0 && (
                    <div className="bg-white p-8 rounded-2xl text-center text-slate-400 font-medium border border-slate-200">
                      Guruhlar yo'q
                    </div>
                  )}
                </div>

                {/* Desktop Table View for Groups (>= md) */}
                <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto w-full">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left px-6 py-4 font-bold text-slate-600 uppercase text-xs">Guruh nomi</th>
                          <th className="text-right px-6 py-4 font-bold text-slate-600 uppercase text-xs">Amallar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {groups.map(g => (
                          <tr key={g.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4 font-bold text-base">
                              <Link href={`/admin/groups/${g.id}`} className="text-blue-600 hover:underline">
                                {g.name}
                              </Link>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button 
                                onClick={() => { setEditingGroupId(g.id); setGroupForm({ name: g.name }); setShowGroupForm(true); }} 
                                className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                              >
                                Tahrirlash
                              </button>
                              <button 
                                onClick={() => deleteGroup(g.id)} 
                                className="text-rose-600 hover:text-rose-800 font-bold text-xs bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                              >
                                O'chirish
                              </button>
                            </td>
                          </tr>
                        ))}
                        {groups.length === 0 && (
                          <tr><td colSpan={2} className="px-6 py-12 text-center text-slate-400 font-medium">Guruhlar yo'q</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Student Form Modal */}
        {showStudentForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {editingStudentId ? 'O\'quvchini tahrirlash' : 'Yangi o\'quvchi'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowStudentForm(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">F.I.SH. *</label>
                  <input required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" value={studentForm.full_name} onChange={e => setStudentForm({...studentForm, full_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Guruhni tanlang yoki kiriting *</label>
                  <input list="groups-list" required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" value={studentForm.group_name} onChange={e => setStudentForm({...studentForm, group_name: e.target.value})} />
                  <datalist id="groups-list">
                    {groups.map(g => <option key={g.id} value={g.name} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tug'ilgan sana (ixtiyoriy)</label>
                  <input type="date" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={studentForm.birth_date} onChange={e => setStudentForm({...studentForm, birth_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Telefon raqam (ixtiyoriy)</label>
                  <input type="tel" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={studentForm.phone} onChange={e => setStudentForm({...studentForm, phone: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowStudentForm(false)} className="px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-sm cursor-pointer">Bekor qilish</button>
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 active:scale-95 transition cursor-pointer">Saqlash</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Group Form Modal */}
        {showGroupForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {editingGroupId ? 'Guruhni tahrirlash' : 'Yangi guruh'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowGroupForm(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleGroupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Guruh nomi *</label>
                  <input required placeholder="Masalan: IG2-26" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" value={groupForm.name} onChange={e => setGroupForm({...groupForm, name: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowGroupForm(false)} className="px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-sm cursor-pointer">Bekor qilish</button>
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 active:scale-95 transition cursor-pointer">Saqlash</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
