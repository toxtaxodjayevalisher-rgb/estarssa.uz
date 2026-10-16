"use client";
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';

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
    <DashboardLayout role="STARSSA">
      <div className="max-w-3xl mx-auto space-y-6 pb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>📚</span> Uyga Vazifalar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Yangi topshiriq kiritish va o'quvchilarga jo'natish
          </p>
        </div>
        
        <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <span>✏️</span> Yangi vazifa kiritish
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Guruh nomi & Sana */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Guruh nomi *
                </label>
                <input 
                  required 
                  className="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm font-medium" 
                  placeholder="Masalan: IG2-26" 
                  value={group_name} 
                  onChange={e => setGroupName(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Qaysi kunga (Sana) *
                </label>
                <input 
                  type="date" 
                  required 
                  className="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm font-medium" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                />
                {date && (
                  <p className="text-xs text-blue-600 font-semibold mt-1">
                    Tanlangan kun: <span suppressHydrationWarning>{new Date(date).toLocaleDateString('uz-UZ', {weekday: 'long', day: 'numeric', month: 'long'})}</span>
                  </p>
                )}
              </div>
            </div>
            
            {/* Fanlar va vazifalar */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Fanlar va vazifalar matni *
              </label>
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
                        className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-rose-200 shadow-xs cursor-pointer"
                      >
                        ✕ O'chirish
                      </button>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Fan nomi</label>
                      <input 
                        required 
                        className="w-full border border-slate-200 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm font-medium" 
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
                        className="w-full border border-slate-200 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm" 
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
                className="mt-3 text-xs sm:text-sm text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl px-4 py-2.5 transition flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                + Yana boshqa fan qo'shish
              </button>
            </div>

            {/* Rasm (ixtiyoriy) */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Rasm (ixtiyoriy)
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => setImage(e.target.files ? e.target.files[0] : null)} 
                className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-50 focus:bg-white outline-none transition text-sm" 
              />
            </div>
            
            {/* Yuborish tugmasi */}
            <div className="pt-3">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold active:scale-95 transition shadow-lg shadow-blue-500/25 disabled:opacity-50 text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Yuborilmoqda...</span>
                  </>
                ) : (
                  <span>Saqlash va Telegramga yuborish ➔</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Faol vazifalar ro'yxati */}
        <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <span>📋</span> Faol vazifalar
          </h2>
          <div className="space-y-4">
            {homeworks.length === 0 ? (
              <p className="text-slate-400 text-sm py-4 text-center">Hozircha faol vazifalar yo'q.</p>
            ) : (
              homeworks.map((hw: any) => (
                <div key={hw.id} className="border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 bg-slate-50/50 hover:bg-slate-50 transition">
                  {hw.image_url && (
                    <img src={hw.image_url} alt="vazifa" className="w-full sm:w-32 h-32 object-cover rounded-xl shadow-xs" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="font-bold text-base text-slate-900">{hw.group_name} - {hw.subject}</span>
                      <span className="bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0" suppressHydrationWarning>
                        {new Date(hw.date).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{hw.content}</p>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Kiritdi: {hw.created_by}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}