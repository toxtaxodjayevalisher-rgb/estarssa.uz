"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

type Student = { id: string, full_name: string, group_name: string };
type StatsData = {
  session_id?: string;
  keldi: Student[];
  kechikdi: Student[];
  kelmadi: Student[];
  status: string;
};

export default function StarssaDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [violators, setViolators] = useState<any[]>([]);
  const [selectedViolator, setSelectedViolator] = useState<any | null>(null);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/attendance/stats').then(r => r.json()).then(data => setStats(data));
    fetch('/api/attendance/top-violators').then(r => r.json()).then(data => setViolators(data));
    fetch('/api/alerts').then(r => r.json()).then(data => setAlerts(data));
  }, []);

  const handleRevert = async () => {
    if (!stats?.session_id) {
      alert('Davomat ID topilmadi. Sahifani yangilang!');
      return;
    }
    if (!confirm('Haqiqatan ham bugungi davomatni bekor qilib, qaytadan qilasizmi?')) return;
    
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit_draft', session_id: stats.session_id })
      });
      
      if (res.ok) {
        alert('Davomat bekor qilindi. Davomat qilish sahifasiga yo\'naltirilmoqdasiz...');
        window.location.href = '/starssa/attendance';
      } else {
        const text = await res.text();
        alert('Server xatosi: ' + res.status + ' ' + text);
      }
    } catch(err: any) {
      alert('Xato: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
      <div className="w-full md:w-64 bg-[#0a1128] text-white shadow-2xl z-20 flex flex-col flex-shrink-0">
        <div className="p-6 text-3xl font-serif font-bold border-b border-slate-700 text-center tracking-wider text-white" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.4)' }}>E-STARSSA</div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-3 md:p-4 space-x-2 md:space-x-0 md:space-y-2 border-b md:border-none border-slate-800">
          <Link href="/starssa" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all transform hover:scale-[1.02]">Asosiy</Link>
          <Link href="/starssa/students" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">O'quvchilar</Link>
          <Link href="/starssa/attendance" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Davomat Qilish</Link>
          <Link href="/starssa/history" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Davomat Tarixi</Link>
          <Link href="/starssa/homework" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Uyga Vazifa</Link>
        
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
        <h1 className="text-3xl font-bold mb-6">STARSSA Kabineti</h1>
        
        {stats && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Bugungi davomat</h2>
              <span className={`px-3 py-1 rounded text-white text-sm ${stats.status === 'Boshlanmagan' ? 'bg-gray-500' : stats.status === 'DRAFT' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                Holati: {stats.status === 'Boshlanmagan' ? 'Qilinmagan' : stats.status === 'DRAFT' ? "Ustoz qayta qilishni so'radi" : 'Qilingan'}
              </span>
            </div>

            {stats.status === 'Boshlanmagan' ? (
              <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                <p className="text-xl">Bugun hali davomat qilinmagan</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 border-l-4 border-green-500 transition">
                  <div className="p-6 cursor-pointer flex flex-col" onClick={() => setExpanded(prev => ({ ...prev, keldi: !prev.keldi }))}>
                    <h3 className="text-green-600 font-bold mb-2 flex justify-between items-center">
                      <span>🟢 Kelganlar</span>
                      <span>{expanded.keldi ? '▲' : '▼'}</span>
                    </h3>
                    <p className="text-3xl font-bold">{stats.keldi.length} <span className="text-sm text-gray-400 font-normal">ta o'quvchi</span></p>
                  </div>
                  {expanded.keldi && (
                    <div className="px-6 pb-6 border-t mt-2">
                      <ul className="pt-2 text-sm space-y-2">
                        {stats.keldi.map(s => <li key={s.id} className="flex justify-between font-medium"><span>{s.full_name}</span> <span className="text-gray-400">{s.group_name}</span></li>)}
                        {stats.keldi.length === 0 && <li className="text-gray-400">Hech kim yo'q</li>}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 border-l-4 border-yellow-500 transition">
                  <div className="p-6 cursor-pointer flex flex-col" onClick={() => setExpanded(prev => ({ ...prev, kechikdi: !prev.kechikdi }))}>
                    <h3 className="text-yellow-600 font-bold mb-2 flex justify-between items-center">
                      <span>🟡 Kechikkanlar</span>
                      <span>{expanded.kechikdi ? '▲' : '▼'}</span>
                    </h3>
                    <p className="text-3xl font-bold">{stats.kechikdi.length} <span className="text-sm text-gray-400 font-normal">ta o'quvchi</span></p>
                  </div>
                  {expanded.kechikdi && (
                    <div className="px-6 pb-6 border-t mt-2">
                      <ul className="pt-2 text-sm space-y-2">
                        {stats.kechikdi.map(s => <li key={s.id} className="flex justify-between font-medium"><span>{s.full_name}</span> <span className="text-gray-400">{s.group_name}</span></li>)}
                        {stats.kechikdi.length === 0 && <li className="text-gray-400">Hech kim yo'q</li>}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 border-l-4 border-red-500 transition">
                  <div className="p-6 cursor-pointer flex flex-col" onClick={() => setExpanded(prev => ({ ...prev, kelmadi: !prev.kelmadi }))}>
                    <h3 className="text-red-600 font-bold mb-2 flex justify-between items-center">
                      <span>🔴 Kelmaganlar</span>
                      <span>{expanded.kelmadi ? '▲' : '▼'}</span>
                    </h3>
                    <p className="text-3xl font-bold">{stats.kelmadi.length} <span className="text-sm text-gray-400 font-normal">ta o'quvchi</span></p>
                  </div>
                  {expanded.kelmadi && (
                    <div className="px-6 pb-6 border-t mt-2">
                      <ul className="pt-2 text-sm space-y-2">
                        {stats.kelmadi.map(s => <li key={s.id} className="flex justify-between font-medium"><span>{s.full_name}</span> <span className="text-gray-400">{s.group_name}</span></li>)}
                        {stats.kelmadi.length === 0 && <li className="text-gray-400">Hech kim yo'q</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        
        {alerts.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-8 rounded-r-lg shadow">
            <h2 className="text-red-700 font-bold text-xl mb-4">⚠️ Diqqat! Tizim ogohlantirishi</h2>
            <div className="space-y-4">
              {alerts.map(a => (
                <div key={a.id} className="bg-white p-4 rounded shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{a.student.full_name}</h3>
                    <p className="text-red-600">{a.reason}</p>
                  </div>
                  <button onClick={() => setSelectedAlert(a)} className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700">
                    Ko'rib chiqish
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats && (stats.status !== 'Boshlanmagan' ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 p-6 mt-8 border-t-4 border-green-500">
            <h2 className="text-xl font-bold mb-2 text-green-700">🎉 Tabriklaymiz!</h2>
            <p className="text-gray-700 text-lg">Siz o'z vazifangizni 80% ni bajardingiz.</p>
            <div className="mt-6 pt-4 border-t border-gray-200">
               <p className="text-gray-600 mb-2 font-medium">Bu aniq to'g'rimi? Xato ketgan bo'lsa, qaytadan tahrirlashingiz mumkin:</p>
               <button onClick={handleRevert} className="bg-red-50 text-red-600 px-4 py-2 rounded border border-red-200 hover:bg-red-100 font-bold transition">
                 Davomatni bekor qilib, qayta qilish
               </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 p-6 mt-8">
            <h2 className="text-xl font-bold mb-4">Davomatni boshlash</h2>
            <p className="text-gray-600 mb-4">Bugungi kun uchun davomatni yuritib, ustozga jo'nating.</p>
            <Link href="/starssa/attendance" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold active:scale-95 transition-all shadow-lg shadow-blue-500/30 hover:bg-blue-700 inline-block">Davomat qilishni boshlash</Link>
          </div>
        ))}

      
        {violators.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 p-6 mt-8 border-t-4 border-red-500">
            <h2 className="text-xl font-bold mb-4 text-red-700">Eng ko'p qoidabuzarlik qilganlar (Oxirgi 1 oy)</h2>
            <div className="grid gap-4">
              {violators.map(v => (
                <div key={v.student.id} onClick={() => setSelectedViolator(v)} className="flex justify-between items-center p-4 border rounded cursor-pointer hover:bg-gray-50">
                  <div className="font-bold text-lg">{v.student.full_name}</div>
                  <div className="text-red-600 font-bold bg-red-100 px-3 py-1 rounded-full">{v.total_violations} marta</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/starssa/history" className="text-blue-600 hover:underline font-bold text-lg mb-8 inline-block">Barcha davomat tarixini ko'rish &rarr;</Link>
        </div>

        
        {selectedAlert && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-red-600">Qoidabuzarlik holati</h2>
                <button onClick={() => setSelectedAlert(null)} className="text-gray-500 hover:text-black font-bold text-xl">&times;</button>
              </div>
              <div className="mb-4 text-sm text-gray-700 bg-gray-50 p-4 rounded border">
                <p><strong>O'quvchi:</strong> {selectedAlert.student.full_name}</p>
                <p><strong>Holat:</strong> {selectedAlert.reason}</p>
              </div>
              <h3 className="font-bold mb-2">Tushuntirish xatlari va sabablari</h3>
              <div className="overflow-y-auto flex-1 mb-4 border p-2 rounded">
                <ul className="space-y-2">
                  {selectedAlert.student.attendances.map((r) => (
                    <li key={r.id} className="p-2 border-b bg-white">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold">{new Date(r.date).toLocaleDateString()}</span>
                        <span className={r.status === 'KELMADI' ? 'text-red-600' : 'text-yellow-600'}>
                          {r.status === 'KELMADI' ? 'Kelmagan' : 'Kechikkan'}
                        </span>
                      </div>
                      <p className="text-sm"><strong>Sabab:</strong> {r.note || 'Kiritilmagan'}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex flex-col space-y-2 mt-auto pt-4 border-t">
                
                  <p className="text-center text-red-600 font-bold p-3 bg-red-50 rounded border border-red-200">
                    Ushbu qoidabuzarlikni faqat USTOZ hal qila oladi. Hozirda kutilmoqda...
                  </p>
  
              </div>
            </div>
          </div>
        )}

        {selectedViolator && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{selectedViolator.student.full_name}</h2>
                <button onClick={() => setSelectedViolator(null)} className="text-gray-500 hover:text-black font-bold text-xl">&times;</button>
              </div>
              <div className="mb-4 text-sm text-gray-600">
                <p><strong>Guruh:</strong> {selectedViolator.student.group_name}</p>
                <p><strong>Telefon:</strong> <a href={`tel:${selectedViolator.student.phone}`} className="text-blue-600">{selectedViolator.student.phone || '-'}</a></p>
                <p><strong>Tug'ilgan sana:</strong> {selectedViolator.student.birth_date ? new Date(selectedViolator.student.birth_date).toLocaleDateString() : '-'}</p>
              </div>
              <h3 className="font-bold mb-2">Tushuntirish xatlari (Oxirgi 1 oy)</h3>
              <div className="overflow-y-auto flex-1">
                <ul className="space-y-3">
                  {selectedViolator.records.map((r: any) => {
                    return (
                      <li key={r.id} className="p-3 border rounded bg-gray-50">
                        <div className="flex justify-between mb-1">
                          <span className="font-bold">{new Date(r.date).toLocaleDateString()}</span>
                          <span className={r.status === 'KELMADI' ? 'text-red-600' : 'text-yellow-600'}>
                            {r.status === 'KELMADI' ? 'Kelmagan' : 'Kechikkan'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700"><strong>Sabab:</strong> {r.note || 'Kiritilmagan'}</p>
                        
                        <div className="mt-2 text-right">
                          <button onClick={async () => {
                            if(!confirm('Haqiqatan ham ushbu qoidabuzarlikni bekor qilib oqlamoqchimisiz?')) return;
                            const res = await fetch('/api/attendance/excuse', { 
                              method: 'POST', 
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ attendance_id: r.id }) 
                            });
                            const data = await res.json();
                            if(data.error) alert(data.error);
                            else {
                               alert('Bekor qilindi va oqlandi!');
                               setSelectedViolator(null);
                               fetch('/api/attendance/top-violators').then(r => r.json()).then(d => setViolators(d));
                            }
                          }} className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200">Bekor qilish (Oqlash)</button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}