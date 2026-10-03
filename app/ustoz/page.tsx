"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

type Student = { id: string, full_name: string, group_name: string };
type StatsData = {
  keldi: Student[];
  kechikdi: Student[];
  kelmadi: Student[];
  status: string;
};

export default function UstozDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [violators, setViolators] = useState<any[]>([]);
  const [selectedViolator, setSelectedViolator] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/attendance/stats').then(r => r.json()).then(data => setStats(data));
    fetch('/api/attendance/top-violators').then(r => r.json()).then(data => setViolators(data));
    fetch('/api/alerts').then(r => r.json()).then(data => setAlerts(data));
  }, []);

  const sendFastMsg = async (msg: string) => {
    const res = await fetch('/api/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    if (res.ok) alert("Xabar Telegramga jo'natildi!");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-[#0a1128] text-white shadow-2xl z-10 flex flex-col">
        <div className="p-6 text-3xl font-serif font-bold border-b border-slate-700 text-center tracking-wider text-white" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.4)' }}>E-STARSSA</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/ustoz" className="block px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all transform hover:scale-[1.02]">Asosiy</Link>
          <Link href="/ustoz/students" className="block px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">O'quvchilar</Link>
          <Link href="/ustoz/approve" className="block px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Tasdiqlash</Link>
          <Link href="/ustoz/history" className="block px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Davomat Tarixi</Link>
        </nav>
        <div className="p-4 mt-auto border-t border-slate-800">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-600 px-4 py-3 rounded-xl text-red-500 hover:text-white font-semibold transition-all group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Chiqish
        </button>
      </div>
      </div>
      <div className="flex-1 p-8 overflow-y-auto text-black relative">
        <h1 className="text-3xl font-bold mb-6">Ustoz Kabineti</h1>
        
        {stats && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Bugungi davomat</h2>
              <span className={`px-3 py-1 rounded text-white text-sm ${stats.status === 'Boshlanmagan' ? 'bg-gray-500' : stats.status === 'DRAFT' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                Holati: {stats.status === 'Boshlanmagan' ? 'Qilinmagan' : stats.status === 'DRAFT' ? "Qayta qilishni so'radim" : 'Qilingan'}
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

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Tasdiqlash kutilayotgan davomatlar</h2>
          {stats && stats.status === 'APPROVED' ? (
             <p className="text-green-700 font-bold bg-green-100 p-4 rounded inline-block">✅ Davomat qilingan, uni telegram orqali ko'rishingiz mumkin</p>
          ) : (
             <Link href="/ustoz/approve" className="bg-green-600 text-white px-6 py-2 rounded inline-block">Davomatlarni ko'rish va tasdiqlash</Link>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 p-6 border-t-4 border-blue-500">
          <h2 className="text-xl font-bold mb-4">Tezkor Telegram xabar jo'natish</h2>
          <div className="flex space-x-2">
            <button onClick={() => sendFastMsg("Menga telefon qilib yubor")} className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200">📞 "Manga telefon qivor"</button>
            <button onClick={() => sendFastMsg("Bugungi davomat qani?")} className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200">📋 "Davomat qani?"</button>
            <button onClick={() => sendFastMsg("STARSSA - qayerdasiz, kutyapmiz")} className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200">⚠️ "Ogohlantirish"</button>
          </div>
        </div>

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
                
                  <button onClick={async () => {
                    const res = await fetch('/api/alerts/resolve', { 
                      method: 'POST', 
                      headers: {'Content-Type':'application/json'},
                      body: JSON.stringify({ alert_id: selectedAlert.id, action: 'excuse' })
                    });
                    if(res.ok) {
                      alert("O'quvchi kechirildi va holatlar uzrli deb topildi.");
                      setSelectedAlert(null);
                      fetch('/api/alerts').then(r=>r.json()).then(d=>setAlerts(d));
                    }
                  }} className="bg-green-600 text-white px-4 py-3 rounded text-center font-bold hover:bg-green-700 w-full">
                    Kechirilsin (Sabablari asosli)
                  </button>
                  <button onClick={async () => {
                    const res = await fetch('/api/alerts/resolve', { 
                      method: 'POST', 
                      headers: {'Content-Type':'application/json'},
                      body: JSON.stringify({ alert_id: selectedAlert.id, action: 'warn' })
                    });
                    if(res.ok) {
                      alert('Ota-onasi ogohlantirildi!');
                      setSelectedAlert(null);
                      fetch('/api/alerts').then(r=>r.json()).then(d=>setAlerts(d));
                    }
                  }} className="bg-red-600 text-white px-4 py-3 rounded text-center font-bold hover:bg-red-700 w-full">
                    Ota-onasini ogohlantirish (Sababsiz)
                  </button>
  
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