"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomeworkPage() {
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [date, setDate] = useState('');
  const [group_name, setGroupName] = useState('IG2-26');
  const [tasks, setTasks] = useState([{ subject: '', content: '' }]);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/homework?status=ACTIVE')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setHomeworks(data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !group_name) return alert("Sana va guruh nomini kiriting");
    if (tasks.some(t => !t.subject.trim() || !t.content.trim())) {
      return alert("Barcha fanlar va ularning vazifalarini to'liq kiriting");
    }

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
        alert("Uyga vazifa muvaffaqiyatli saqlandi va Telegram guruhiga yuborildi!");
        setDate('');
        setTasks([{ subject: '', content: '' }]);
        setImage(null);
        fetch('/api/homework?status=ACTIVE')
          .then(r => r.json())
          .then(data => { if (Array.isArray(data)) setHomeworks(data); });
      } else {
        const err = await res.text();
        alert("Xatolik: " + err);
      }
    } catch(err: any) {
      alert("Xato: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-slate-50 overflow-hidden font-sans">
      <div className="w-full md:w-64 bg-[#0a1128] text-white shadow-2xl z-20 flex flex-col flex-shrink-0">
        <div className="p-6 text-2xl font-bold border-b border-slate-700 text-center tracking-wider text-white">E-STARSSA</div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-3 md:p-4 space-x-2 md:space-x-0 md:space-y-2 border-b md:border-none border-slate-800">
          <Link href="/starssa" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium">Asosiy</Link>
          <Link href="/starssa/students" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium">O'quvchilar</Link>
          <Link href="/starssa/attendance" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium">Davomat Qilish</Link>
          <Link href="/starssa/history" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium">Davomat Tarixi</Link>
          <Link href="/starssa/homework" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 font-bold text-white">Uyga Vazifa</Link>
          <Link href="/starssa/announcements" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium">E'lonlar</Link>
        </nav>
        <div className="p-4 mt-auto border-t border-slate-800 hidden md:block">
          <Link href="/logout" className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-600 px-4 py-2.5 rounded-xl text-red-500 hover:text-white font-semibold transition-all">
            Chiqish
          </Link>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto text-slate-800 relative w-full">
        <div className="max-w-3xl space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Uyga Vazifalar</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Yangi topshiriq kiritish va o'quvchilarga jo'natish</p>
          </div>
          
          <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-gray-100">
              Yangi vazifa kiritish
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Qator 1: Guruh nomi */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Guruh nomi *</label>
                <input 
                  required 
                  className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium" 
                  placeholder="Masalan: IG2-26" 
                  value={group_name} 
                  onChange={e => setGroupName(e.target.value)} 
                />
              </div>

              {/* Qator 2: Qaysi kunga (Sana) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Qaysi kunga (Sana) *</label>
                <input 
                  type="date" 
                  required 
                  className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                />
                {date && (
                  <p className="text-xs text-blue-600 font-semibold mt-1.5">
                    Tanlangan kun: {new Date(date).toLocaleDateString('uz-UZ', {weekday: 'long', day: 'numeric', month: 'long'})}
                  </p>
                )}
              </div>
              
              {/* Qator 3: Fanlar va vazifalar */}
              <div className="pt-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Fanlar va vazifalar matni *</label>
                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative space-y-3">
                      {tasks.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => {
                            const newTasks = [...tasks];
                            newTasks.splice(index, 1);
                            setTasks(newTasks);
                          }} 
                          className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 text-xs font-bold bg-white px-2 py-1 rounded-md border border-rose-200 shadow-sm"
                        >
                          ✕ O'chirish
                        </button>
                      )}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Fan nomi</label>
                        <input 
                          required 
                          className="w-full border border-gray-200 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" 
                          placeholder="Masalan: Matematika" 
                          value={task.subject} 
                          onChange={e => {
                            const newTasks = [...tasks];
                            newTasks[index].subject = e.target.value;
                            setTasks(newTasks);
                          }} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Vazifa matni</label>
                        <textarea 
                          required 
                          rows={3} 
                          className="w-full border border-gray-200 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" 
                          placeholder="Uyga vazifani batafsil kiriting..." 
                          value={task.content} 
                          onChange={e => {
                            const newTasks = [...tasks];
                            newTasks[index].content = e.target.value;
                            setTasks(newTasks);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  type="button" 
                  onClick={() => setTasks([...tasks, { subject: '', content: '' }])} 
                  className="mt-3 text-xs sm:text-sm text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl px-4 py-2 transition-all flex items-center gap-1"
                >
                  + Yana boshqa fan qo'shish
                </button>
              </div>

              {/* Qator 4: Rasm (ixtiyoriy) */}
              <div className="pt-2">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Rasm (ixtiyoriy)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setImage(e.target.files ? e.target.files[0] : null)} 
                  className="w-full border border-gray-200 p-2.5 rounded-xl bg-gray-50 focus:bg-white outline-none transition-all text-sm" 
                />
              </div>
              
              {/* Qator 5: Yuborish tugmasi */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold active:scale-95 transition-all shadow-md shadow-blue-500/30 disabled:opacity-50 text-sm"
                >
                  {loading ? 'Yuborilmoqda...' : 'Saqlash va Telegramga yuborish'}
                </button>
              </div>
            </form>
          </div>

          {/* Faol vazifalar ro'yxati */}
          <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-gray-100">Faol vazifalar</h2>
            <div className="space-y-4">
              {homeworks.length === 0 ? (
                <p className="text-gray-500 text-sm">Hozircha faol vazifalar yo'q.</p>
              ) : (
                homeworks.map((hw: any) => (
                  <div key={hw.id} className="border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row gap-4 bg-slate-50/50">
                    {hw.image_url && (
                      <img src={hw.image_url} alt="vazifa" className="w-full md:w-32 h-32 object-cover rounded-lg shadow-sm" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-base text-blue-900">{hw.group_name} - {hw.subject}</span>
                        <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full text-xs font-bold">
                          {new Date(hw.date).toLocaleDateString('uz-UZ')}
                        </span>
                      </div>
                      <p className="text-slate-700 text-sm whitespace-pre-wrap">{hw.content}</p>
                      <p className="text-xs text-gray-400 mt-2 font-medium">Kiritdi: {hw.created_by}</p>
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