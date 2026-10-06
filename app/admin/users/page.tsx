"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

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
    if (filterRole && u.role !== filterRole) return false;
    if (filterGroup && u.assigned_group !== filterGroup) return false;
    return true;
  });

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-[#0a1128] text-white shadow-2xl z-20 flex flex-col flex-shrink-0">
        <div className="p-6 text-3xl font-serif font-bold border-b border-slate-700 text-center tracking-wider text-white" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.4)' }}>
          E-STARSSA
        </div>
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

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto text-black relative w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Akkauntlar Boshqaruvi</h1>
            <p className="text-gray-500 text-sm mt-1">Ustoz, Starssa va Admin login/parollarini yaratish, tahrirlash va o'chirish</p>
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

        {/* Standart mavjud login va parollar eslatmasi */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-2xl shadow-md mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <span>🔑</span> Tizimda mavjud asosiy login va parollar
            </h2>
            <span className="text-xs text-blue-200 bg-white/10 px-2.5 py-1 rounded-full font-medium">Boshlang'ich hisoblar</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <span className="text-red-300 font-bold block mb-1">👑 Admin</span>
              <p className="text-gray-200">F.I.SH: <span className="font-semibold text-white">Admin Alisher</span></p>
              <p className="text-gray-200">Login: <code className="bg-black/30 px-1 py-0.5 rounded text-yellow-300 font-mono">Alisher</code></p>
              <p className="text-gray-200">Parol: <code className="bg-black/30 px-1 py-0.5 rounded text-yellow-300 font-mono">Alisher86438(</code></p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <span className="text-green-300 font-bold block mb-1">👨‍🏫 Ustoz</span>
              <p className="text-gray-200">F.I.SH: <span className="font-semibold text-white">Bosh Ustoz (Shahnoza)</span></p>
              <p className="text-gray-200">Login: <code className="bg-black/30 px-1 py-0.5 rounded text-yellow-300 font-mono">Shahnozateacher</code></p>
              <p className="text-gray-200">Parol: <code className="bg-black/30 px-1 py-0.5 rounded text-yellow-300 font-mono">Shm0007@</code></p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <span className="text-blue-300 font-bold block mb-1">⭐ Starssa (Asosiy)</span>
              <p className="text-gray-200">F.I.SH: <span className="font-semibold text-white">Xumoyunmirzo</span></p>
              <p className="text-gray-200">Login: <code className="bg-black/30 px-1 py-0.5 rounded text-yellow-300 font-mono">xumyunmirzo</code></p>
              <p className="text-gray-200">Parol: <code className="bg-black/30 px-1 py-0.5 rounded text-yellow-300 font-mono">thexumo00</code></p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <span className="text-blue-300 font-bold block mb-1">⭐ Starssa (Qizlar)</span>
              <p className="text-gray-200">F.I.SH: <span className="font-semibold text-white">Mohinur</span></p>
              <p className="text-gray-200">Login: <code className="bg-black/30 px-1 py-0.5 rounded text-yellow-300 font-mono">moxinur</code></p>
              <p className="text-gray-200">Parol: <code className="bg-black/30 px-1 py-0.5 rounded text-yellow-300 font-mono">themoxinur081</code></p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-600">Rol:</label>
            <select 
              value={filterRole} 
              onChange={e => setFilterRole(e.target.value)} 
              className="border border-gray-300 rounded-xl px-3 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Barchasi</option>
              <option value="USTOZ">Ustozlar</option>
              <option value="STARSSA">Starssalar</option>
              <option value="ADMIN">Adminlar</option>
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
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto w-full">
<table className="min-w-full text-sm whitespace-nowrap md:whitespace-normal">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600 uppercase text-xs">F.I.SH.</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600 uppercase text-xs">Login</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600 uppercase text-xs">Roli</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600 uppercase text-xs">Guruh</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600 uppercase text-xs">Telefon</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600 uppercase text-xs">Status</th>
                  <th className="text-right px-6 py-4 font-semibold text-gray-600 uppercase text-xs">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">{u.full_name}</td>
                    <td className="px-6 py-4 font-mono text-gray-600 text-xs bg-slate-50 px-2 py-1 rounded inline-block my-3 ml-6">{u.username}</td>
                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                    <td className="px-6 py-4">
                      {u.assigned_group ? (
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold">
                          {u.assigned_group}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">{u.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.status === 'ACTIVE' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                        {u.status === 'ACTIVE' ? 'Faol' : 'Bloklangan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button 
                        onClick={() => handleOpenEdit(u)} 
                        className="text-blue-600 hover:text-blue-800 font-semibold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Tahrirlash
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id, u.full_name)} 
                        className="text-red-600 hover:text-red-800 font-semibold text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        O'chirish
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">
                      Hech qanday akkaunt topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
                      <option value="ADMIN">Admin (Boshqaruvchi)</option>
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
    </div>
  );
}
