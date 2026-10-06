"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Announcement {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_by: string;
  created_at: string;
}

export default function AnnouncementsClient({ role }: { role: string }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      if (Array.isArray(data)) setAnnouncements(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return alert("Barcha maydonlarni to'ldiring");
    
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) formData.append('image', image);

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setTitle('');
        setContent('');
        setImage(null);
        setShowForm(false);
        fetchAnnouncements();
      } else {
        alert("Xatolik yuz berdi");
      }
    } catch (e) {
      alert("Xatolik");
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm("Rostdan ham ushbu e'lonni o'chirmoqchimisiz? Bu amal Telegram guruhidan ham xabarni o'chirib tashlaydi!")) return;
    
    try {
      const res = await fetch(\`/api/announcements/\${id}\`, { method: 'DELETE' });
      if (res.ok) {
        fetchAnnouncements();
      } else {
        alert("O'chirishda xatolik yuz berdi");
      }
    } catch (e) {
      alert("Xatolik");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">E'lonlar va Yangiliklar</h1>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95 whitespace-nowrap"
        >
          {showForm ? 'Yopish' : '+ Yangi E\'lon'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 mb-8 transition-all">
          <h2 className="text-xl font-bold mb-4">E'lon yaratish</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Sarlavha</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
                placeholder="E'lon sarlavhasi..."
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Matn</label>
              <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px]"
                required
                placeholder="E'lon matni..."
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Rasm (ixtiyoriy)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)} 
                className="w-full border border-gray-200 p-2 rounded-xl bg-gray-50 outline-none transition-all"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/30 flex justify-center disabled:opacity-75"
            >
              {loading ? 'Yuborilmoqda...' : 'E\'lon qilish'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {announcements.map((a) => (
          <div key={a.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-blue-900 pr-12">{a.title}</h3>
              <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                {a.created_by}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap mb-4 leading-relaxed">{a.content}</p>
            {a.image_url && (
              <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden mb-4">
                <Image src={a.image_url} alt="E'lon rasmi" fill className="object-cover" />
              </div>
            )}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-400">
                {new Date(a.created_at).toLocaleString('uz-UZ')}
              </div>
              
              {(role === 'ADMIN' || role === 'USTOZ') && (
                <button 
                  onClick={() => deleteAnnouncement(a.id)} 
                  className="text-red-500 hover:text-red-700 text-sm font-bold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all"
                >
                  O'chirish
                </button>
              )}
            </div>
          </div>
        ))}
        
        {announcements.length === 0 && !loading && (
          <div className="text-center p-12 bg-white rounded-2xl border border-slate-100 text-gray-500">
            Hozircha e'lonlar yo'q
          </div>
        )}
      </div>
    </div>
  );
}
