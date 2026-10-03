"use client";
import { useState, useEffect } from 'react';

export default function HomeworkPage() {
  const [homeworks, setHomeworks] = useState([]);
  const [formData, setFormData] = useState({ date: '', group_name: '', subject: '', content: '' });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/homework?status=ACTIVE').then(r => r.json()).then(setHomeworks);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const body = new FormData();
    body.append('date', formData.date);
    body.append('subject', formData.subject);
    body.append('group_name', formData.group_name);
    body.append('content', formData.content);
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Uyga vazifalar</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
        <h2 className="text-xl font-bold mb-4">Yangi vazifa kiritish</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Guruh nomi</label>
              <input required className="w-full border p-2 rounded" placeholder="Masalan: IG2-26" value={formData.group_name} onChange={e => setFormData({...formData, group_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fan</label>
              <input required className="w-full border p-2 rounded" placeholder="Masalan: Matematika" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Qaysi kunga (muddat)</label>
            <input type="date" required className="w-full border p-2 rounded" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vazifa matni</label>
            <textarea required rows={4} className="w-full border p-2 rounded" placeholder="Uyga vazifani kiriting..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}></textarea>
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
  );
}
