"use client";
import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { formatUzDateShort } from '@/lib/date';
import DashboardLayout from '@/app/components/DashboardLayout';

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
    <DashboardLayout role="ADMIN">
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>🏆</span> Guruhlar Reytingi va Sertifikat
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Davomat ko'rsatkichlari bo'yicha eng yuqori guruhlar va avtomatik sertifikat
            </p>
          </div>
        </div>
        
        {loading ? (
          <div className="p-16 text-center text-slate-500 font-medium flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Yuklanmoqda...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Guruhlar reytingi */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>📊</span> Guruhlar O'zlashtirishi (Davomat)
              </h3>
              <div className="space-y-3">
                {stats?.groupRankings?.map((group: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-50/80 rounded-2xl border border-slate-100 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm ${idx === 0 ? 'bg-amber-100 text-amber-700 shadow-xs' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white border border-slate-200 text-slate-400'}`}>
                        {idx === 0 ? '🏆' : idx + 1}
                      </div>
                      <span className="font-bold text-base text-slate-900">{group.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 sm:w-32 bg-slate-200 rounded-full h-2 hidden sm:block overflow-hidden">
                        <div className={`h-2 rounded-full ${group.percentage >= 80 ? 'bg-emerald-500' : group.percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${group.percentage}%` }}></div>
                      </div>
                      <span className={`font-extrabold text-base sm:text-lg ${group.percentage >= 80 ? 'text-emerald-600' : group.percentage >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {group.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
                {(!stats?.groupRankings || stats.groupRankings.length === 0) && (
                  <p className="text-slate-400 text-center py-8">Hozircha ma'lumot yo'q</p>
                )}
              </div>
            </div>

            {/* Sertifikat bo'limi */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 sm:p-6 flex flex-col items-center">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 text-center">
                Avtomatik Tashakkurnoma
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-5 text-center">
                Tizim bo'yicha eng yaxshi davomatga ega guruh uchun
              </p>
              
              {bestGroup ? (
                <>
                  {/* CERTIFICATE UI (HTML) */}
                  <div className="w-full overflow-x-auto flex justify-center py-1">
                    <div 
                      ref={certificateRef}
                      className="w-full max-w-md aspect-[1.414/1] bg-white border-[10px] border-[#0a1128] rounded-xl relative overflow-hidden flex flex-col items-center justify-center text-center p-5 sm:p-6 shadow-xl"
                      style={{
                        backgroundImage: 'radial-gradient(circle, #ffffff 0%, #f1f5f9 100%)'
                      }}
                    >
                      <div className="absolute top-0 left-0 w-full h-full border-2 border-yellow-500/30 m-1.5 pointer-events-none"></div>
                      
                      <div className="mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto flex items-center justify-center text-white text-2xl shadow-md border-2 border-white">
                          🏆
                        </div>
                      </div>
                      
                      <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-[#0a1128] mb-1 uppercase tracking-widest">
                        Tashakkurnoma
                      </h2>
                      <div className="w-20 h-0.5 bg-yellow-500 mb-3"></div>
                      
                      <p className="text-xs text-slate-600 italic mb-1">Ushbu tashakkurnoma</p>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-700 mb-1">{bestGroup.name}</h3>
                      <p className="text-xs text-slate-600 italic mb-4 max-w-xs leading-relaxed">
                        guruhiga a'lo darajadagi davomat ({bestGroup.percentage}%) uchun minnatdorchilik sifatida taqdim etiladi.
                      </p>
                      
                      <div className="mt-auto w-full flex justify-between items-end px-4 pt-2">
                        <div className="text-center">
                          <div className="w-20 border-b border-slate-800 mb-0.5"></div>
                          <p className="text-[10px] font-bold text-slate-600 uppercase">E-Starssa</p>
                        </div>
                        <div className="text-center">
                          <p suppressHydrationWarning className="text-xs font-bold text-slate-800">{formatUzDateShort()}</p>
                          <p className="text-[10px] font-bold text-slate-600 uppercase">Sana</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={downloadCertificate}
                    className="mt-6 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    <span>Sertifikatni yuklab olish (PNG)</span>
                  </button>
                </>
              ) : (
                <div className="text-center p-8 bg-slate-50 rounded-2xl w-full border border-dashed border-slate-300">
                  <p className="text-slate-400 text-sm">Guruhlar haqida ma'lumot yetarli emas.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
