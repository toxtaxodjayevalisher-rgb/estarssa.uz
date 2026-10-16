"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/DashboardLayout';

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

  if (loading) return (
    <DashboardLayout role="ADMIN">
      <div className="p-16 text-center text-slate-500 font-medium">Yuklanmoqda...</div>
    </DashboardLayout>
  );

  const ustozlar = users.filter(u => u.role === 'USTOZ');
  const starssalar = users.filter(u => u.role === 'STARSSA');

  return (
    <DashboardLayout role="ADMIN">
      <div className="max-w-6xl mx-auto space-y-6 pb-8">
        <div>
          <Link href="/admin/students" className="text-blue-600 hover:text-blue-800 font-bold text-xs sm:text-sm inline-flex items-center gap-1 mb-3">
            <span>&larr;</span>
            <span>Guruhlar ro'yxatiga qaytish</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {group?.name} guruhi boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Guruhga biriktirilgan Ustoz va Starssalar nazorati
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ustoz section */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>👨‍🏫</span> Guruh Ustozi
              </h2>
              <button 
                onClick={() => handleCreate('USTOZ')} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
              >
                + Ustoz yaratish
              </button>
            </div>
            {ustozlar.length === 0 ? (
              <p className="text-slate-400 text-sm py-4">Ustoz tayinlanmagan</p>
            ) : (
              <div className="space-y-3">
                {ustozlar.map(u => (
                  <div key={u.id} className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                    <p className="font-bold text-slate-900 text-base">{u.full_name}</p>
                    <p className="text-xs font-mono text-emerald-800 mt-0.5">Login: {u.username}</p>
                    {u.phone && <p className="text-xs text-slate-600 mt-1">📞 {u.phone}</p>}
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => handleEdit(u)} className="text-xs font-bold text-blue-600 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-xs cursor-pointer">Tahrirlash</button>
                      <button onClick={() => handleDelete(u.id)} className="text-xs font-bold text-rose-600 bg-white px-2.5 py-1 rounded-lg border border-rose-200 shadow-xs cursor-pointer">O'chirish</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Starssa section */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>⭐</span> Guruh Sardorlari (Starssa)
              </h2>
              {starssalar.length < 2 && (
                <button 
                  onClick={() => handleCreate('STARSSA')} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
                >
                  + Sardor yaratish
                </button>
              )}
            </div>
            {starssalar.length === 0 ? (
              <p className="text-slate-400 text-sm py-4">Sardorlar tayinlanmagan</p>
            ) : (
              <div className="space-y-3">
                {starssalar.map(u => (
                  <div key={u.id} className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100">
                    <p className="font-bold text-slate-900 text-base">{u.full_name}</p>
                    <p className="text-xs font-mono text-blue-800 mt-0.5">Login: {u.username}</p>
                    {u.phone && <p className="text-xs text-slate-600 mt-1">📞 {u.phone}</p>}
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => handleEdit(u)} className="text-xs font-bold text-blue-600 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-xs cursor-pointer">Tahrirlash</button>
                      <button onClick={() => handleDelete(u.id)} className="text-xs font-bold text-rose-600 bg-white px-2.5 py-1 rounded-lg border border-rose-200 shadow-xs cursor-pointer">O'chirish</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-4">* Bitta guruhga ko'pi bilan 2 ta Starssa tayinlash tavsiya etiladi.</p>
          </div>
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {formData.role === 'USTOZ' ? 'Ustoz' : 'Starssa'} {editingId ? 'tahrirlash' : 'yaratish'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">F.I.SH. *</label>
                  <input required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Login *</label>
                    <input required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Parol {editingId ? '(yangi)' : '*'}</label>
                    <input type="text" required={!editingId} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={editingId ? "Bo'sh qoldirish mumkin" : "Parol kiriting"} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Telefon raqami (ixtiyoriy)</label>
                  <input type="tel" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+998901234567" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tug'ilgan sanasi (ixtiyoriy)</label>
                  <input type="date" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-sm cursor-pointer">Bekor qilish</button>
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
