"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import html2canvas from 'html2canvas';

export default function RatingsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    const canvas = await html2canvas(certificateRef.current, { scale: 2 });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `Sertifikat-${stats?.groupRankings?.[0]?.name || 'Guruh'}.png`;
    link.click();
  };

  const bestGroup = stats?.groupRankings?.[0];

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-slate-50 overflow-hidden">
      {/* Sidebar (Shortened version just for layout, keeping consistency) */}
      <div className="w-full md:w-64 bg-[#0a1128] text-white shadow-2xl z-20 flex flex-col flex-shrink-0">
        <div className="p-6 text-2xl font-serif font-bold border-b border-slate-700 text-center tracking-wider text-white" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.4)' }}>E-STARSSA</div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-3 md:p-4 space-x-2 md:space-x-0 md:space-y-2 border-b md:border-none border-slate-800">
          <Link href="/admin" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Asosiy</Link>
          <Link href="/admin/students" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">O'quvchilar</Link>
          <Link href="/admin/attendance" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Davomat</Link>
          <Link href="/admin/announcements" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">E'lonlar</Link>
          <Link href="/admin/ratings" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all transform hover:scale-[1.02]">Reyting & Sertifikat</Link>
        </nav>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto text-black">
        <h1 className="text-3xl font-bold mb-6 text-slate-800">Guruhlar Reytingi va Sertifikat</h1>
        
        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-xl font-bold mb-4">Guruhlar O'zlashtirishi (Davomat)</h3>
              <div className="space-y-4">
                {stats?.groupRankings?.map((group: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${idx === 0 ? 'bg-yellow-100 text-yellow-600 shadow-sm' : idx === 1 ? 'bg-slate-200 text-slate-600' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white border text-slate-400'}`}>
                        {idx === 0 ? '🏆' : idx + 1}
                      </div>
                      <span className="font-bold text-lg text-slate-700">{group.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2.5 hidden sm:block">
                        <div className={`h-2.5 rounded-full ${group.percentage >= 80 ? 'bg-green-500' : group.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${group.percentage}%` }}></div>
                      </div>
                      <span className={`font-bold text-lg ${group.percentage >= 80 ? 'text-green-600' : group.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {group.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center">
              <h3 className="text-xl font-bold mb-4 text-center">Avtomatik Tashakkurnoma</h3>
              <p className="text-sm text-slate-500 mb-6 text-center">Tizim bo'yicha eng yaxshi davomatga ega guruh uchun</p>
              
              {bestGroup ? (
                <>
                  {/* CERTIFICATE UI (HTML) */}
                  <div 
                    ref={certificateRef}
                    className="w-full max-w-lg aspect-[1.414/1] bg-white border-[12px] border-[#0a1128] rounded-lg relative overflow-hidden flex flex-col items-center justify-center text-center p-8 shadow-2xl"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #ffffff 0%, #f1f5f9 100%)'
                    }}
                  >
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-yellow-500/30 m-2"></div>
                    <div className="absolute -top-12 -left-12 w-32 h-32 bg-blue-600 rounded-full opacity-10"></div>
                    <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-yellow-500 rounded-full opacity-10"></div>
                    
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto flex items-center justify-center text-white text-3xl shadow-lg border-2 border-white">
                        🏆
                      </div>
                    </div>
                    
                    <h1 className="text-3xl font-serif font-extrabold text-[#0a1128] mb-2 uppercase tracking-widest">
                      Tashakkurnoma
                    </h1>
                    <div className="w-32 h-1 bg-yellow-500 mb-6"></div>
                    
                    <p className="text-slate-600 font-medium italic mb-4">Ushbu tashakkurnoma</p>
                    <h2 className="text-4xl font-bold text-blue-700 mb-2">{bestGroup.name}</h2>
                    <p className="text-slate-600 font-medium italic mb-6">guruhiga a'lo darajadagi davomat ({bestGroup.percentage}%) uchun minnatdorchilik sifatida taqdim etiladi.</p>
                    
                    <div className="mt-auto w-full flex justify-between items-end px-8">
                      <div className="text-center">
                        <div className="w-24 border-b-2 border-slate-800 mb-1"></div>
                        <p className="text-xs font-bold text-slate-600 uppercase">E-Starssa Ma'muriyati</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString()}</p>
                        <p className="text-xs font-bold text-slate-600 uppercase">Sana</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={downloadCertificate}
                    className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    Sertifikatni yuklab olish
                  </button>
                </>
              ) : (
                <div className="text-center p-8 bg-slate-50 rounded-xl w-full border border-dashed border-slate-300">
                  <p className="text-slate-500">Guruhlar haqida ma'lumot yetarli emas.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
