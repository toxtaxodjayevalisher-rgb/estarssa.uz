"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomeworkPage() {
  const [homeworks, setHomeworks] = useState([]);
  const [date, setDate] = useState('');
  const [group_name, setGroupName] = useState('');
  const [tasks, setTasks] = useState([{ subject: '', content: '' }]);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/homework?status=ACTIVE').then(r => r.json()).then(setHomeworks);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const body = new FormData();
    body.append('date', date);
    body.append('group_name', group_name);
    body.append('tasks', JSON.stringify(tasks));
    if (image) body.append('image', image);

    try {
      const res = await fetch('/api/homework', {
        method: 'POST',
        body
      });
      if (res.ok) {
        alert("Uyga vazifa saqlandi va botga yuborildi!");
        setFormData({ date: '', group_name: '', subject: '', content: '' });
        setImage(null);
        fetch('/api/homework?status=ACTIVE').then(r => r.json()).then(setHomeworks);
      } else {
        const err = await res.text();
        alert("Xatolik: " + err);
      }
    } catch(err: any) {
      alert("Xato: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
      <div className="w-full md:w-64 bg-[#0a1128] text-white shadow-2xl z-20 flex flex-col flex-shrink-0">
        <div className="p-6 text-3xl font-serif font-bold border-b border-slate-700 text-center tracking-wider text-white" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.4)' }}>E-STARSSA</div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-3 md:p-4 space-x-2 md:space-x-0 md:space-y-2 border-b md:border-none border-slate-800">
          <a href="/starssa" className="block px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Asosiy</a>
          <a href="/starssa/students" className="block px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">O'quvchilar</a>
          <a href="/starssa/attendance" className="block px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Davomat Qilish</a>
          <a href="/starssa/history" className="block px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Davomat Tarixi</a>
          <a href="/starssa/homework" className="block px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all transform hover:scale-[1.02]">Uyga Vazifa</a>
        
          <Link href="/starssa/announcements" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">E'lonlar</Link>
        </nav>
        <div className="p-4 mt-auto border-t border-slate-800 hidden md:block">
        <Link href="/logout" className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-600 px-4 py-3 rounded-xl text-red-500 hover:text-white font-semibold transition-all group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Chiqish</Link>
      </div>
      </div>
      <div className="flex-1 p-4 md:p-8 overflow-y-auto text-black relative w-full">
        <div className="space-y-6">
      
      <h1 className="text-2xl font-bold">Uyga vazifalar</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 transition-all hover:shadow-xl border-t-4 border-blue-500">
        <h2 className="text-xl font-bold mb-4">Yangi vazifa kiritish</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Guruh nomi</label>
              <input required className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="Masalan: IG2-26" value={group_name} onChange={e => setGroupName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Qaysi kunga (Sana va hafta kuni)</label>
              <input type="date" required className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" value={date} onChange={e => setDate(e.target.value)} />
              {date && <p className="text-xs text-gray-500 mt-1">Tanlangan kun: {new Date(date).toLocaleDateString('uz-UZ', {weekday: 'long', day: 'numeric', month: 'long'})}</p>}
            </div>
          </div>
          
          <div className="mt-4 border-t pt-4">
            <h3 className="font-bold text-lg mb-4">Fanlar va vazifalar:</h3>
            {tasks.map((task, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded border mb-4 relative">
                {tasks.length > 1 && (
                  <button type="button" onClick={() => {
                    const newTasks = [...tasks];
                    newTasks.splice(index, 1);
                    setTasks(newTasks);
                  }} className="absolute top-2 right-2 text-red-500 text-sm font-bold">O'chirish</button>
                )}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Fan nomi</label>
                  <input required className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="Masalan: Matematika" value={task.subject} onChange={e => {
                    const newTasks = [...tasks];
                    newTasks[index].subject = e.target.value;
                    setTasks(newTasks);
                  }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vazifa matni</label>
                  <textarea required rows={3} className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="Uyga vazifani kiriting..." value={task.content} onChange={e => {
                    const newTasks = [...tasks];
                    newTasks[index].content = e.target.value;
                    setTasks(newTasks);
                  }}></textarea>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setTasks([...tasks, { subject: '', content: '' }])} className="text-blue-600 border border-blue-600 rounded px-4 py-2 hover:bg-blue-50">
              + Yana boshqa fan qo'shish
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Rasm (ixtiyoriy)</label>
            <input type="file" accept="image/*" onChange={e => setImage(e.target.files ? e.target.files[0] : null)} className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50" />
          </div>
          
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold active:scale-95 transition-all shadow-lg shadow-blue-500/30 hover:bg-blue-700 font-bold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Yuborilmoqda...' : 'Saqlash va Yuborish'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 transition-all hover:shadow-xl mt-8">
        <h2 className="text-xl font-bold mb-4">Faol vazifalar</h2>
        <div className="grid gap-4">
          {homeworks.length === 0 ? (
            <p className="text-gray-500">Hozircha faol vazifalar yo'q.</p>
          ) : (
            homeworks.map((hw: any) => (
              <div key={hw.id} className="border p-4 rounded-lg flex flex-col md:flex-row gap-4">
                {hw.image_url && (
                  <img src={hw.image_url} alt="vazifa" className="w-32 h-32 object-cover rounded shadow" />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-lg text-blue-800">{hw.group_name} - {hw.subject}</span>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                      {new Date(hw.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{hw.content}</p>
                  <p className="text-xs text-gray-400 mt-2">Kiritdi: {hw.created_by}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}