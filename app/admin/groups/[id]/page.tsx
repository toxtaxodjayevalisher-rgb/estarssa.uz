"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function GroupDetails() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role: '', full_name: '', phone: '', birth_date: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const fetchData = async () => {
    try {
      // We need group name
      const gRes = await fetch('/api/groups');
      const allGroups = await gRes.json();
      const current = allGroups.find((g: any) => g.id === groupId);
      if (!current) {
        router.push('/admin/students');
        return;
      }
      setGroup(current);

      const uRes = await fetch(`/api/users?assigned_group=${encodeURIComponent(current.name)}`);
      if (uRes.ok) {
        setUsers(await uRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (role: string) => {
    setEditingId(null);
    setFormData({ username: '', password: '', role, full_name: '', phone: '', birth_date: '' });
    setShowForm(true);
  };

  const handleEdit = (u: any) => {
    setEditingId(u.id);
    setFormData({ 
      username: u.username, 
      password: '', 
      role: u.role, 
      full_name: u.full_name, 
      phone: u.phone || '', 
      birth_date: u.birth_date ? u.birth_date.split('T')[0] : '' 
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/users/${editingId}` : '/api/users';
    const method = editingId ? 'PUT' : 'POST';
    
    const dataToSend: any = { ...formData, assigned_group: group.name };
    if (editingId && !dataToSend.password) delete dataToSend.password;
    if (!dataToSend.phone) delete dataToSend.phone;
    if (!dataToSend.birth_date) delete dataToSend.birth_date;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    });
    
    if (res.ok) {
      await fetchData();
      setShowForm(false);
    } else {
      const err = await res.json();
      alert(err.error || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
    else alert("O'chirishda xatolik");
  };

  if (loading) return <div className="p-8 text-center">Yuklanmoqda...</div>;

  const ustozlar = users.filter(u => u.role === 'USTOZ');
  const starssalar = users.filter(u => u.role === 'STARSSA');

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-slate-50 overflow-hidden">
      <div className="w-full md:w-64 bg-[#0a1128] text-white shadow-2xl z-20 flex flex-col flex-shrink-0">
        <div className="p-6 text-3xl font-serif font-bold border-b border-slate-700 text-center tracking-wider text-white">E-STARSSA</div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-3 md:p-4 space-x-2 md:space-x-0 md:space-y-2">
          <Link href="/admin" className="block px-4 py-3 hover:bg-white/10 rounded-xl transition-all">Asosiy</Link>
          <Link href="/admin/students" className="block px-4 py-3 bg-blue-600 rounded-xl shadow-lg font-bold">O'quvchilar</Link>
          <Link href="/admin/attendance" className="block px-4 py-3 hover:bg-white/10 rounded-xl transition-all">Davomat</Link>
          <Link href="/admin/users" className="block px-4 py-3 hover:bg-white/10 rounded-xl transition-all">Akkauntlar</Link>
          <Link href="/admin/announcements" className="block px-4 py-3 hover:bg-white/10 rounded-xl transition-all">E'lonlar</Link>
        </nav>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto text-black relative w-full">
        <Link href="/admin/students" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Guruhlar ro'yxatiga qaytish</Link>
        <h1 className="text-3xl font-bold mb-6">{group?.name} guruhi boshqaruvi</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ustoz section */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Guruh Ustozi</h2>
              <button onClick={() => handleCreate('USTOZ')} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow hover:bg-green-700">+ Ustoz yaratish</button>
            </div>
            {ustozlar.length === 0 ? <p className="text-gray-500">Ustoz tayinlanmagan</p> : (
              <div className="space-y-3">
                {ustozlar.map(u => (
                  <div key={u.id} className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="font-bold text-green-900">{u.full_name}</p>
                    <p className="text-sm text-green-700">Login: {u.username}</p>
                    {u.phone && <p className="text-sm text-green-700">Tel: {u.phone}</p>}
                    <div className="mt-3 flex space-x-2">
                      <button onClick={() => handleEdit(u)} className="text-xs font-bold text-blue-600 hover:underline">Tahrirlash</button>
                      <button onClick={() => handleDelete(u.id)} className="text-xs font-bold text-red-600 hover:underline">O'chirish</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Starssa section */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Guruh Sardorlari (Starssa)</h2>
              {starssalar.length < 2 && (
                <button onClick={() => handleCreate('STARSSA')} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow hover:bg-blue-700">+ Sardor yaratish</button>
              )}
            </div>
            {starssalar.length === 0 ? <p className="text-gray-500">Sardorlar tayinlanmagan</p> : (
              <div className="space-y-3">
                {starssalar.map(u => (
                  <div key={u.id} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="font-bold text-blue-900">{u.full_name}</p>
                    <p className="text-sm text-blue-700">Login: {u.username}</p>
                    {u.phone && <p className="text-sm text-blue-700">Tel: {u.phone}</p>}
                    <div className="mt-3 flex space-x-2">
                      <button onClick={() => handleEdit(u)} className="text-xs font-bold text-blue-600 hover:underline">Tahrirlash</button>
                      <button onClick={() => handleDelete(u.id)} className="text-xs font-bold text-red-600 hover:underline">O'chirish</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-4">* Bitta guruhga uzog'i 2 ta Starssa tayinlash mumkin.</p>
          </div>
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {formData.role === 'USTOZ' ? 'Ustoz' : 'Starssa'} {editingId ? 'tahrirlash' : 'yaratish'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">F.I.SH.</label>
                  <input required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Login</label>
                    <input required className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parol {editingId && '(yangi)'}</label>
                    <input type="text" required={!editingId} className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon raqami (ixtiyoriy)</label>
                  <input type="tel" className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+998901234567" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tug'ilgan sanasi (ixtiyoriy)</label>
                  <input type="date" className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
                </div>
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
