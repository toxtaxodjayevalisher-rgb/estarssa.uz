"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

type Student = { id: string, full_name: string, group_name: string, phone: string | null, birth_date: string | null };
type Group = { id: string, name: string };

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filterGroup, setFilterGroup] = useState<string>('');
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

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-slate-50 overflow-hidden">
      <div className="w-full md:w-64 bg-[#0a1128] text-white shadow-2xl z-20 flex flex-col flex-shrink-0">
        <div className="p-6 text-3xl font-serif font-bold border-b border-slate-700 text-center tracking-wider text-white" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.4)' }}>E-STARSSA</div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-3 md:p-4 space-x-2 md:space-x-0 md:space-y-2 border-b md:border-none border-slate-800">
          <Link href="/admin" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Asosiy</Link>
          <Link href="/admin/students" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all transform hover:scale-[1.02]">O'quvchilar</Link>
          <Link href="/admin/attendance" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Davomat</Link>
          <Link href="/admin/users" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Akkauntlar</Link>
          <Link href="/admin/announcements" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">E'lonlar</Link>
            <Link href="/admin/ratings" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Reyting</Link>
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
        <h1 className="text-3xl font-bold mb-6">O'quvchilar va Guruhlar</h1>
        
        <div className="flex space-x-4 mb-6">
          <button onClick={() => setActiveTab('STUDENTS')} className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'STUDENTS' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>O'quvchilar</button>
          <button onClick={() => setActiveTab('GROUPS')} className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'GROUPS' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>Guruhlar</button>
        </div>
        
        {loading ? <p>Yuklanmoqda...</p> : (
          <>
            {activeTab === 'STUDENTS' && (
              <div>
                <div className="flex justify-end mb-4">
                  <button onClick={() => { setEditingStudentId(null); setStudentForm({ full_name: '', group_name: '', phone: '', birth_date: '' }); setShowStudentForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 shadow-lg active:scale-95 transition-all">
                    + O'quvchi qo'shish
                  </button>
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto w-full">
<table className="min-w-full text-sm whitespace-nowrap md:whitespace-normal">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase w-16">#</th>
                          <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">F.I.SH.</th>
                        <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Guruh</th>
                        <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Tug'ilgan sana</th>
                        <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Telefon</th>
                        <th className="text-right px-6 py-4 font-medium text-gray-500 uppercase">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {students.filter(s => filterGroup ? s.group_name === filterGroup : true).map((s, idx) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-500 font-bold">{idx + 1}</td>
                            <td className="px-6 py-4 font-semibold">{s.full_name}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">{s.group_name}</span>
                          </td>
                          <td className="px-6 py-4">{s.birth_date ? new Date(s.birth_date).toLocaleDateString() : '-'}</td>
                          <td className="px-6 py-4">{s.phone || '-'}</td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button onClick={() => { setEditingStudentId(s.id); setStudentForm({ full_name: s.full_name, group_name: s.group_name, phone: s.phone || '', birth_date: s.birth_date ? s.birth_date.split('T')[0] : '' }); setShowStudentForm(true); }} className="text-blue-600 hover:text-blue-800 font-medium">Tahrirlash</button>
                            <button onClick={() => deleteStudent(s.id)} className="text-red-600 hover:text-red-800 font-medium">O'chirish</button>
                          </td>
                        </tr>
                      ))}
                      {students.filter(s => filterGroup ? s.group_name === filterGroup : true).length === 0 && (<tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">O'quvchilar yo'q</td></tr>)}
                    </tbody>
                  </table>
</div>
                </div>
              </div>
            )}

            {activeTab === 'GROUPS' && (
              <div>
                <div className="flex justify-end mb-4">
                  <button onClick={() => { setEditingGroupId(null); setGroupForm({ name: '' }); setShowGroupForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 shadow-lg active:scale-95 transition-all">
                    + Guruh yaratish
                  </button>
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto w-full">
<table className="min-w-full text-sm whitespace-nowrap md:whitespace-normal">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Guruh nomi</th>
                        <th className="text-right px-6 py-4 font-medium text-gray-500 uppercase">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {groups.map(g => (
                        <tr key={g.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-lg"><Link href={`/admin/groups/${g.id}`} className="text-blue-600 hover:underline">{g.name}</Link></td>
                          <td className="px-6 py-4 text-right space-x-3">
                            <button onClick={() => { setEditingGroupId(g.id); setGroupForm({ name: g.name }); setShowGroupForm(true); }} className="text-blue-600 hover:text-blue-800 font-medium">Tahrirlash</button>
                            <button onClick={() => deleteGroup(g.id)} className="text-red-600 hover:text-red-800 font-medium">O'chirish</button>
                          </td>
                        </tr>
                      ))}
                      {groups.length === 0 && (<tr><td colSpan={2} className="px-6 py-4 text-center text-gray-500">Guruhlar yo'q</td></tr>)}
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
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">{editingStudentId ? 'O\'quvchini tahrirlash' : 'Yangi o\'quvchi'}</h2>
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">F.I.SH.</label>
                  <input required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={studentForm.full_name} onChange={e => setStudentForm({...studentForm, full_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guruhni tanlang yoki kiriting</label>
                  <input list="groups-list" required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={studentForm.group_name} onChange={e => setStudentForm({...studentForm, group_name: e.target.value})} />
                  <datalist id="groups-list">
                    {groups.map(g => <option key={g.id} value={g.name} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tug'ilgan sana (ixtiyoriy)</label>
                  <input type="date" className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={studentForm.birth_date} onChange={e => setStudentForm({...studentForm, birth_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon raqam (ixtiyoriy)</label>
                  <input type="tel" className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={studentForm.phone} onChange={e => setStudentForm({...studentForm, phone: e.target.value})} />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button type="button" onClick={() => setShowStudentForm(false)} className="px-5 py-2.5 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">Bekor qilish</button>
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 font-medium text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all">Saqlash</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Group Form Modal */}
        {showGroupForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-sm transform transition-all">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">{editingGroupId ? 'Guruhni tahrirlash' : 'Yangi guruh'}</h2>
              <form onSubmit={handleGroupSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guruh nomi (masalan: 101, Front-End)</label>
                  <input required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={groupForm.name} onChange={e => setGroupForm({...groupForm, name: e.target.value})} />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button type="button" onClick={() => setShowGroupForm(false)} className="px-5 py-2.5 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">Bekor qilish</button>
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 font-medium text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all">Saqlash</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
