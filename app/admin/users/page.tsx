"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';

type User = { 
  id: string; 
  username: string; 
  role: string; 
  full_name: string; 
  status: string; 
  created_at: string; 
  assigned_group?: string | null;
  phone?: string | null;
  birth_date?: string | null;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    role: 'STARSSA', 
    full_name: '', 
    status: 'ACTIVE', 
    assigned_group: '',
    phone: '',
    birth_date: ''
  });
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');
  const [filterGroup, setFilterGroup] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [uRes, gRes] = await Promise.all([fetch('/api/users'), fetch('/api/groups')]);
      if (uRes.status === 401) {
        setErrorMsg("Sessiya muddati tugagan yoki ruxsat yo'q. Iltimos qayta login qiling.");
        return;
      }
      if (uRes.ok) {
        setUsers(await uRes.json());
      } else {
        setErrorMsg("Akkauntlarni yuklashda xatolik yuz berdi");
      }
      if (gRes.ok) setGroups(await gRes.json());
    } catch (e) {
      console.error(e);
      setErrorMsg("Tarmoq xatosi yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ 
      username: '', 
      password: '', 
      role: 'STARSSA', 
      full_name: '', 
      status: 'ACTIVE', 
      assigned_group: '',
      phone: '',
      birth_date: ''
    });
    setShowForm(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingId(u.id);
    setFormData({ 
      username: u.username, 
      password: '', 
      role: u.role, 
      full_name: u.full_name, 
      status: u.status, 
      assigned_group: u.assigned_group || '',
      phone: u.phone || '',
      birth_date: u.birth_date ? u.birth_date.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/users/${editingId}` : '/api/users';
    const method = editingId ? 'PUT' : 'POST';
    
    const dataToSend: any = { ...formData };
    if (editingId && !dataToSend.password) delete dataToSend.password;
    if (!dataToSend.assigned_group) dataToSend.assigned_group = null;
    if (!dataToSend.phone) dataToSend.phone = null;
    if (!dataToSend.birth_date) dataToSend.birth_date = null;
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      
      if (res.ok) {
        await fetchData();
        setShowForm(false);
        setEditingId(null);
      } else {
        const err = await res.json();
        alert(err.error || "Xatolik yuz berdi");
      }
    } catch (err) {
      alert("Server bilan aloqa xatosi");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Haqiqatan ham "${name}" akkauntini o'chirmoqchimisiz?`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "O'chirishda xatolik");
      }
    } catch (err) {
      alert("Xatolik yuz berdi");
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'ADMIN') return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Admin</span>;
    if (role === 'USTOZ') return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Ustoz</span>;
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Starssa</span>;
  };

  const filteredUsers = users.filter(u => {
    if (u.role === 'ADMIN') return false;
    if (filterRole && u.role !== filterRole) return false;
    if (filterGroup && u.assigned_group !== filterGroup) return false;
    return true;
  });

  return (
    <DashboardLayout role="ADMIN">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Akkauntlar Boshqaruvi</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Ustoz va Starssa login/parollarini yaratish, tahrirlash va boshqarish</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchData} 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-1"
              title="Yangilash"
            >
              🔄 Qayta yuklash
            </button>
            <button 
              onClick={handleOpenCreate} 
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="text-lg">+</span> Yangi akkaunt ochish
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-sm font-semibold">{errorMsg}</p>
            </div>
            <Link href="/" className="bg-red-600 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-red-700 transition-all">
              Qayta kirish
            </Link>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-600">Rol:</label>
            <select 
              value={filterRole} 
              onChange={e => setFilterRole(e.target.value)} 
              className="border border-gray-300 rounded-xl px-3 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Barchasi (Ustoz & Starssa)</option>
              <option value="USTOZ">Ustozlar</option>
              <option value="STARSSA">Starssalar</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-600">Guruh:</label>
            <select 
              value={filterGroup} 
              onChange={e => setFilterGroup(e.target.value)} 
              className="border border-gray-300 rounded-xl px-3 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Barcha guruhlar</option>
              {groups.map(g => (
                <option key={g.id} value={g.name}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="text-xs text-gray-400 ml-auto font-medium">
            Jami: {filteredUsers.length} ta akkaunt
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium">Yuklanmoqda...</div>
        ) : (
          <div>
            {/* Mobile Card List (< md) */}
            <div className="md:hidden space-y-3">
              {filteredUsers.map(u => (
                <div key={u.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-base truncate">{u.full_name}</h3>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">@{u.username}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {getRoleBadge(u.role)}
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${u.status === 'ACTIVE' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-rose-700 bg-rose-50 border border-rose-200'}`}>
                        {u.status === 'ACTIVE' ? 'Faol' : 'Blok'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-3 pt-2 border-t border-slate-100">
                    {u.assigned_group && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md font-bold">
                        👥 {u.assigned_group}
                      </span>
                    )}
                    {u.phone && (
                      <span className="text-slate-500">
                        📞 {u.phone}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <button 
                      type="button"
                      onClick={() => handleOpenEdit(u)} 
                      className="py-2.5 px-3 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 active:scale-95 rounded-xl transition text-center cursor-pointer"
                    >
                      ✏️ Tahrirlash
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDelete(u.id, u.full_name)} 
                      className="py-2.5 px-3 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 active:scale-95 rounded-xl transition text-center cursor-pointer"
                    >
                      🗑️ O'chirish
                    </button>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="bg-white p-8 rounded-2xl text-center text-slate-400 font-medium border border-slate-200">
                  Hech qanday akkaunt topilmadi
                </div>
              )}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-4 font-bold text-slate-600 uppercase text-xs">F.I.SH.</th>
                      <th className="text-left px-6 py-4 font-bold text-slate-600 uppercase text-xs">Login</th>
                      <th className="text-left px-6 py-4 font-bold text-slate-600 uppercase text-xs">Roli</th>
                      <th className="text-left px-6 py-4 font-bold text-slate-600 uppercase text-xs">Guruh</th>
                      <th className="text-left px-6 py-4 font-bold text-slate-600 uppercase text-xs">Telefon</th>
                      <th className="text-left px-6 py-4 font-bold text-slate-600 uppercase text-xs">Status</th>
                      <th className="text-right px-6 py-4 font-bold text-slate-600 uppercase text-xs">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{u.full_name}</td>
                        <td className="px-6 py-4 font-mono text-slate-600 text-xs bg-slate-50 px-2 py-1 rounded inline-block my-3 ml-6">{u.username}</td>
                        <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                        <td className="px-6 py-4">
                          {u.assigned_group ? (
                            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold">
                              {u.assigned_group}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-xs">{u.phone || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.status === 'ACTIVE' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-rose-700 bg-rose-50 border border-rose-200'}`}>
                            {u.status === 'ACTIVE' ? 'Faol' : 'Bloklangan'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => handleOpenEdit(u)} 
                            className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            Tahrirlash
                          </button>
                          <button 
                            onClick={() => handleDelete(u.id, u.full_name)} 
                            className="text-rose-600 hover:text-rose-800 font-bold text-xs bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            O'chirish
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                          Hech qanday akkaunt topilmadi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingId ? 'Akkauntni tahrirlash' : 'Yangi akkaunt yaratish'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">F.I.SH. *</label>
                  <input 
                    required 
                    className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.full_name} 
                    onChange={e => setFormData({...formData, full_name: e.target.value})} 
                    placeholder="Masalan: Abdullayev Temur"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Login (Username) *</label>
                    <input 
                      required 
                      className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={formData.username} 
                      onChange={e => setFormData({...formData, username: e.target.value})} 
                      placeholder="Login tanlang"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Parol {editingId ? '(yangi bo\'lsa)' : '*'}
                    </label>
                    <input 
                      type="text" 
                      required={!editingId} 
                      className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                      placeholder={editingId ? "O'zgartirmaslik uchun bo'sh" : "Parol kiriting"}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Roli *</label>
                    <select 
                      required 
                      className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium" 
                      value={formData.role} 
                      onChange={e => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="STARSSA">Starssa (Sardor)</option>
                      <option value="USTOZ">Ustoz (O'qituvchi)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-semibold text-gray-700">Biriktirilgan guruh</label>
                      <button 
                        type="button" 
                        onClick={async () => {
                          const gName = prompt("Yangi guruh nomini kiriting (masalan: Frontend 01):");
                          if (!gName || gName.trim() === '') return;
                          try {
                            const res = await fetch('/api/groups', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ name: gName.trim() })
                            });
                            if (res.ok) {
                              const newG = await res.json();
                              setGroups([...groups, newG]);
                              setFormData({...formData, assigned_group: newG.name});
                            } else {
                              const err = await res.json();
                              alert(err.error || "Guruh yaratishda xatolik");
                            }
                          } catch (e) {
                            alert("Xatolik yuz berdi");
                          }
                        }}
                        className="text-xs text-blue-600 font-bold hover:text-blue-800 transition-colors"
                      >
                        + Yangi guruh ochish
                      </button>
                    </div>
                    <select 
                      className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
                      value={formData.assigned_group} 
                      onChange={e => setFormData({...formData, assigned_group: e.target.value})}
                    >
                      <option value="">— Guruh tanlanmagan —</option>
                      {groups.map(g => (
                        <option key={g.id} value={g.name}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Telefon raqami (ixtiyoriy)</label>
                    <input 
                      type="tel" 
                      className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                      placeholder="+998901234567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tug'ilgan sana (ixtiyoriy)</label>
                    <input 
                      type="date" 
                      className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={formData.birth_date} 
                      onChange={e => setFormData({...formData, birth_date: e.target.value})} 
                    />
                  </div>
                </div>

                {editingId && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                    <select 
                      required 
                      className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium" 
                      value={formData.status} 
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="ACTIVE">Faol (ACTIVE) — Tizimga kira oladi</option>
                      <option value="INACTIVE">Bloklangan (INACTIVE) — Kirish taqiqlanadi</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="px-5 py-2.5 text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                  >
                    Bekor qilish
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 bg-blue-600 font-bold text-white rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    {editingId ? 'Saqlash' : 'Yaratish'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
