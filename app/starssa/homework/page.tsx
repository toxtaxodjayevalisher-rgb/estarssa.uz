"use client";
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
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-700 text-center">E-STARSSA</div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="/starssa" className="block px-4 py-2 hover:bg-slate-800 rounded">Asosiy</a>
          <a href="/starssa/students" className="block px-4 py-2 hover:bg-slate-800 rounded">O'quvchilar</a>
          <a href="/starssa/attendance" className="block px-4 py-2 hover:bg-slate-800 rounded">Davomat Qilish</a>
          <a href="/starssa/history" className="block px-4 py-2 hover:bg-slate-800 rounded">Davomat Tarixi</a>
          <a href="/starssa/homework" className="block px-4 py-2 bg-blue-600 rounded">Uyga Vazifa</a>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <p className="text-sm">Akkaunt: STARSSA</p>
          <button className="mt-2 w-full bg-red-600 px-4 py-2 rounded text-white text-sm" onClick={() => {
            fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/login');
          }}>Chiqish</button>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-y-auto text-black relative">
        <div className="space-y-6">
      
      <h1 className="text-2xl font-bold">Uyga vazifalar</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
        <h2 className="text-xl font-bold mb-4">Yangi vazifa kiritish</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Guruh nomi</label>
              <input required className="w-full border p-2 rounded" placeholder="Masalan: IG2-26" value={group_name} onChange={e => setGroupName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Qaysi kunga (Sana va hafta kuni)</label>
              <input type="date" required className="w-full border p-2 rounded" value={date} onChange={e => setDate(e.target.value)} />
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
                  <input required className="w-full border p-2 rounded" placeholder="Masalan: Matematika" value={task.subject} onChange={e => {
                    const newTasks = [...tasks];
                    newTasks[index].subject = e.target.value;
                    setTasks(newTasks);
                  }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vazifa matni</label>
                  <textarea required rows={3} className="w-full border p-2 rounded" placeholder="Uyga vazifani kiriting..." value={task.content} onChange={e => {
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
            <input type="file" accept="image/*" onChange={e => setImage(e.target.files ? e.target.files[0] : null)} className="w-full border p-2 rounded bg-gray-50" />
          </div>
          
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Yuborilmoqda...' : 'Saqlash va Yuborish'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-8">
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