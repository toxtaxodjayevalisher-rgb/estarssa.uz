"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

type User = { id: string, username: string, role: string, full_name: string, status: string, created_at: string, assigned_group?: string };

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'STARSSA', full_name: '', status: 'ACTIVE', assigned_group: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [uRes, gRes] = await Promise.all([fetch('/api/users'), fetch('/api/groups')]);
    if (uRes.ok) setUsers(await uRes.json());
    if (gRes.ok) setGroups(await gRes.json());
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/users/${editingId}` : '/api/users';
    const method = editingId ? 'PUT' : 'POST';
    
    const dataToSend: any = { ...formData };
    if (editingId && !dataToSend.password) delete dataToSend.password;
    if (!dataToSend.assigned_group) dataToSend.assigned_group = null;
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    });
    
    if (res.ok) {
      await fetchData();
      setShowForm(false);
      setEditingId(null);
      setFormData({ username: '', password: '', role: 'STARSSA', full_name: '', status: 'ACTIVE', assigned_group: '' });
    } else {
      const err = await res.json();
      alert(err.error || "Xatolik yuz berdi");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
    else {
      const err = await res.json();
      alert(err.error || "Xatolik");
    }
  };

  const getRoleLabel = (role: string) => {
    if (role === 'ADMIN') return 'Admin';
    if (role === 'USTOZ') return 'Ustoz';
    return 'Starssa';
  };

  const openEdit = (u: User) => {
    setEditingId(u.id);
    setFormData({ username: u.username, password: '', role: u.role, full_name: u.full_name, status: u.status, assigned_group: u.assigned_group || '' });
    setShowForm(true);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
      <div className="w-full md:w-64 bg-[#0a1128] text-white shadow-2xl z-20 flex flex-col flex-shrink-0">
        <div className="p-6 text-3xl font-serif font-bold border-b border-slate-700 text-center tracking-wider text-white" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.4)' }}>E-STARSSA</div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-3 md:p-4 space-x-2 md:space-x-0 md:space-y-2 border-b md:border-none border-slate-800">
          <Link href="/admin" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Asosiy</Link>
          <Link href="/admin/students" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">O'quvchilar</Link>
          <Link href="/admin/attendance" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Davomat</Link>
          <Link href="/admin/users" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all transform hover:scale-[1.02]">Akkauntlar</Link>
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
          <h1 className="text-3xl font-bold">Akkauntlar</h1>
          <button onClick={() => { setEditingId(null); setFormData({ username: '', password: '', role: 'STARSSA', full_name: '', status: 'ACTIVE', assigned_group: '' }); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">+ Yangi akkaunt</button>
        </div>
        
        {loading ? <p>Yuklanmoqda...</p> : (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 transition-all overflow-hidden">
            <table className="min-w-full block md:table overflow-x-auto whitespace-nowrap md:whitespace-normal text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">F.I.SH.</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Login</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Rol</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Guruh</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-right px-6 py-4 font-medium text-gray-500 uppercase">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">{u.full_name}</td>
                    <td className="px-6 py-4">{u.username}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : u.role === 'USTOZ' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.assigned_group ? (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">{u.assigned_group}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${u.status === 'ACTIVE' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>{u.status === 'ACTIVE' ? 'Faol' : 'Bloklangan'}</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEdit(u)} className="text-blue-600 hover:text-blue-800 font-medium">Tahrirlash</button>
                      <button onClick={() => deleteUser(u.id)} className="text-red-600 hover:text-red-800 font-medium ml-2">O'chirish</button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Akkauntlar yo'q</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">{editingId ? 'Akkauntni tahrirlash' : 'Yangi akkaunt'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">F.I.SH.</label>
                  <input required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Login</label>
                  <input required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parol {editingId && '(o\'zgartirish uchun kiriting)'}</label>
                  <input type="text" required={!editingId} className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Roli</label>
                  <select required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="STARSSA">Starssa</option>
                    <option value="USTOZ">Ustoz</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biriktirilgan guruh</label>
                  <select className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={formData.assigned_group} onChange={e => setFormData({...formData, assigned_group: e.target.value})}>
                    <option value="">— Guruh tanlanmagan —</option>
                    {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                  </select>
                </div>
                {editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="ACTIVE">Faol (ACTIVE)</option>
                      <option value="INACTIVE">Bloklangan (INACTIVE)</option>
                    </select>
                  </div>
                )}
                <div className="flex justify-end space-x-3 mt-6">
                  <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">Bekor qilish</button>
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
