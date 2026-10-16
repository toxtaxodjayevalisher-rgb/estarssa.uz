"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import BirthdayBanner from '@/app/components/BirthdayBanner';
import { formatUzDate, formatUzDateShort } from '@/lib/date';
import DashboardLayout from '@/app/components/DashboardLayout';

type Student = { id: string, full_name: string, group_name: string, phone?: string, birth_date?: string };
type StatsData = {
  session_id?: string;
  keldi: Student[];
  kechikdi: Student[];
  sababli?: Student[];
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

  // Excusing state & notice
  const [excusingId, setExcusingId] = useState<string | null>(null);
  const [modalNotice, setModalNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/attendance/stats').then(r => r.json()).then(data => setStats(data)).catch(() => {});
    fetch('/api/attendance/top-violators').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setViolators(data);
    }).catch(() => {});
    fetch('/api/alerts').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setAlerts(data);
    }).catch(() => {});
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

  const handleExcuse = async (attendanceId: string) => {
    if (!confirm("Haqiqatan ham ushbu qoidabuzarlikni bekor qilib oqlamoqchimisiz?")) return;
    setExcusingId(attendanceId);
    setModalNotice(null);
    try {
      const res = await fetch('/api/attendance/excuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance_id: attendanceId })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setModalNotice("✓ Ushbu qoidabuzarlik oqlandi va uzrli deb topildi!");
        setTimeout(() => setModalNotice(null), 4000);

        // Update modal state
        setSelectedViolator((prev: any) => {
          if (!prev) return null;
          const updatedRecords = prev.records.filter((r: any) => r.id !== attendanceId);
          return {
            ...prev,
            total_violations: Math.max(0, prev.total_violations - 1),
            records: updatedRecords
          };
        });

        // Refresh violators in dashboard
        fetch('/api/attendance/top-violators')
          .then(r => r.json())
          .then(d => {
            if (Array.isArray(d)) setViolators(d);
          })
          .catch(() => {});
      }
    } catch (err: any) {
      alert("Server xatosi: " + err.message);
    } finally {
      setExcusingId(null);
    }
  };

  return (
    <DashboardLayout role="STARSSA">
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">STARSSA Kabineti</h1>
            <p className="text-sm text-slate-500 mt-1">Guruh davomati, ogohlantirishlar va qoidabuzarliklar nazorati</p>
          </div>
          <div suppressHydrationWarning className="text-xs sm:text-sm text-slate-500 font-medium bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm inline-flex items-center gap-2">
            <span>📅</span> {formatUzDate()}
          </div>
        </div>

        {/* Tug'ilgan kun tabrigi */}
        <BirthdayBanner />
        
        {/* Bugungi davomat */}
        {stats && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span>📊</span> Bugungi davomat
              </h2>
              <span className={`px-3 py-1 rounded-full text-white text-xs sm:text-sm font-semibold shadow-sm ${
                stats.status === 'Boshlanmagan' ? 'bg-slate-500' : 
                stats.status === 'DRAFT' ? 'bg-amber-500' : 
                stats.status === 'SENT_FOR_APPROVAL' ? 'bg-blue-600' : 'bg-emerald-600'
              }`}>
                Holati: {
                  stats.status === 'Boshlanmagan' ? 'Qilinmagan' : 
                  stats.status === 'DRAFT' ? "Ustoz qayta qilishni so'radi" : 
                  stats.status === 'SENT_FOR_APPROVAL' ? "Tasdiqlashga yuborilgan" : 'Tasdiqlangan'
                }
              </span>
            </div>

            {stats.status === 'Boshlanmagan' ? (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-500">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-lg font-semibold text-slate-700">Bugun hali davomat qilinmagan</p>
                <p className="text-sm text-slate-400 mt-1">Guruh o'quvchilari kelishi bilan davomatni yuritishni boshlang</p>
                <Link href="/starssa/attendance" className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition active:scale-95 text-sm">
                  Davomat qilishga o'tish →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {/* Kelganlar */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md border-l-4 border-emerald-500">
                  <div className="p-5 cursor-pointer flex flex-col" onClick={() => setExpanded(prev => ({ ...prev, keldi: !prev.keldi }))}>
                    <h3 className="text-emerald-700 font-bold mb-1 flex justify-between items-center text-sm">
                      <span>🟢 Kelganlar</span>
                      <span className="text-xs text-slate-400">{expanded.keldi ? '▲' : '▼'}</span>
                    </h3>
                    <p className="text-3xl font-black text-slate-800">{stats.keldi.length} <span className="text-xs text-slate-400 font-normal">ta o'quvchi</span></p>
                  </div>
                  {expanded.keldi && (
                    <div className="px-5 pb-5 border-t border-slate-100 mt-1 pt-3 max-h-48 overflow-y-auto">
                      <ul className="text-sm space-y-1.5">
                        {stats.keldi.map(s => <li key={s.id} className="flex justify-between font-medium text-slate-700"><span>{s.full_name}</span> <span className="text-xs text-slate-400">{s.group_name}</span></li>)}
                        {stats.keldi.length === 0 && <li className="text-slate-400 text-xs">Hech kim yo'q</li>}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Kechikkanlar */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md border-l-4 border-amber-500">
                  <div className="p-5 cursor-pointer flex flex-col" onClick={() => setExpanded(prev => ({ ...prev, kechikdi: !prev.kechikdi }))}>
                    <h3 className="text-amber-700 font-bold mb-1 flex justify-between items-center text-sm">
                      <span>🟡 Kechikkanlar</span>
                      <span className="text-xs text-slate-400">{expanded.kechikdi ? '▲' : '▼'}</span>
                    </h3>
                    <p className="text-3xl font-black text-slate-800">{stats.kechikdi.length} <span className="text-xs text-slate-400 font-normal">ta o'quvchi</span></p>
                  </div>
                  {expanded.kechikdi && (
                    <div className="px-5 pb-5 border-t border-slate-100 mt-1 pt-3 max-h-48 overflow-y-auto">
                      <ul className="text-sm space-y-1.5">
                        {stats.kechikdi.map(s => <li key={s.id} className="flex justify-between font-medium text-slate-700"><span>{s.full_name}</span> <span className="text-xs text-slate-400">{s.group_name}</span></li>)}
                        {stats.kechikdi.length === 0 && <li className="text-slate-400 text-xs">Hech kim yo'q</li>}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Sababli */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md border-l-4 border-blue-500">
                  <div className="p-5 cursor-pointer flex flex-col" onClick={() => setExpanded(prev => ({ ...prev, sababli: !prev.sababli }))}>
                    <h3 className="text-blue-700 font-bold mb-1 flex justify-between items-center text-sm">
                      <span>🔵 Sababli</span>
                      <span className="text-xs text-slate-400">{expanded.sababli ? '▲' : '▼'}</span>
                    </h3>
                    <p className="text-3xl font-black text-slate-800">{(stats.sababli || []).length} <span className="text-xs text-slate-400 font-normal">ta o'quvchi</span></p>
                  </div>
                  {expanded.sababli && (
                    <div className="px-5 pb-5 border-t border-slate-100 mt-1 pt-3 max-h-48 overflow-y-auto">
                      <ul className="text-sm space-y-1.5">
                        {(stats.sababli || []).map(s => <li key={s.id} className="flex justify-between font-medium text-slate-700"><span>{s.full_name}</span> <span className="text-xs text-slate-400">{s.group_name}</span></li>)}
                        {(!stats.sababli || stats.sababli.length === 0) && <li className="text-slate-400 text-xs">Hech kim yo'q</li>}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Kelmaganlar */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md border-l-4 border-rose-500">
                  <div className="p-5 cursor-pointer flex flex-col" onClick={() => setExpanded(prev => ({ ...prev, kelmadi: !prev.kelmadi }))}>
                    <h3 className="text-rose-700 font-bold mb-1 flex justify-between items-center text-sm">
                      <span>🔴 Kelmaganlar</span>
                      <span className="text-xs text-slate-400">{expanded.kelmadi ? '▲' : '▼'}</span>
                    </h3>
                    <p className="text-3xl font-black text-slate-800">{stats.kelmadi.length} <span className="text-xs text-slate-400 font-normal">ta o'quvchi</span></p>
                  </div>
                  {expanded.kelmadi && (
                    <div className="px-5 pb-5 border-t border-slate-100 mt-1 pt-3 max-h-48 overflow-y-auto">
                      <ul className="text-sm space-y-1.5">
                        {stats.kelmadi.map(s => <li key={s.id} className="flex justify-between font-medium text-slate-700"><span>{s.full_name}</span> <span className="text-xs text-slate-400">{s.group_name}</span></li>)}
                        {stats.kelmadi.length === 0 && <li className="text-slate-400 text-xs">Hech kim yo'q</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="bg-rose-50 border-l-4 border-rose-600 p-5 rounded-2xl shadow-sm">
            <h2 className="text-rose-800 font-bold text-lg mb-3 flex items-center gap-2">
              <span>⚠️</span> Diqqat! Tizim ogohlantirishi
            </h2>
            <div className="space-y-3">
              {alerts.map(a => (
                <div key={a.id} className="bg-white p-4 rounded-xl shadow-xs border border-rose-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{a.student.full_name}</h3>
                    <p className="text-rose-600 text-xs font-semibold mt-0.5">{a.reason}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedAlert(a)} 
                    className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
                  >
                    Ko'rib chiqish
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Davomat status banner & re-submission */}
        {stats && (stats.status !== 'Boshlanmagan' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md border-t-4 border-emerald-500">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🎉</span>
              <h2 className="text-xl font-bold text-emerald-800">Davomat qilingan!</h2>
            </div>
            <p className="text-slate-600 text-sm">
              Bugungi davomat ma'lumotlari tizimga kiritilgan. Agar xatolik ketgan bo'lsa, qaytadan tahrirlash uchun bekor qilishingiz mumkin.
            </p>
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-500">Davomatni yangilash yoki tuzatish talab etilsa:</span>
              <button 
                onClick={handleRevert} 
                className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 flex items-center gap-1.5"
              >
                <span>⚠️</span> Davomatni bekor qilib, qayta qilish
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md">
            <h2 className="text-xl font-bold mb-2 text-slate-800">Davomatni boshlash</h2>
            <p className="text-slate-600 text-sm mb-4">Bugungi kun uchun davomatni yuritib, ustozga tasdiqlash uchun jo'nating.</p>
            <Link 
              href="/starssa/attendance" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm active:scale-95 transition-all shadow-md inline-flex items-center gap-2"
            >
              <span>📋</span> Davomat qilishni boshlash
            </Link>
          </div>
        ))}

        {/* ENG KO'P QOIDABUZARLIK QILGANLAR (OXIRGI 1 OY) */}
        {violators.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md border-t-4 border-rose-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚨</span>
                <div>
                  <h2 className="text-xl font-bold text-rose-700">Eng ko'p qoidabuzarlik qilganlar (Oxirgi 1 oy)</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Ko'p dars qoldirgan o'quvchilar ro'yxati. Har bir holatni ko'rish yoki bekor qilish (oqlash) mumkin.</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-rose-50 text-rose-700 px-3 py-1 rounded-full border border-rose-200">
                Top {violators.length} ta o'quvchi
              </span>
            </div>

            <div className="grid gap-3">
              {violators.map((v, index) => {
                const rankStyles = [
                  'bg-gradient-to-r from-amber-500 to-yellow-400 text-white shadow-amber-200',
                  'bg-gradient-to-r from-slate-400 to-slate-300 text-white shadow-slate-200',
                  'bg-gradient-to-r from-amber-700 to-amber-600 text-white shadow-amber-300',
                  'bg-slate-100 text-slate-700',
                  'bg-slate-100 text-slate-700'
                ];
                const rankMedals = ['🥇', '🥈', '🥉', '4', '5'];

                return (
                  <div
                    key={v.student.id}
                    onClick={() => setSelectedViolator(v)}
                    className="group bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all hover:shadow-md hover:border-slate-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0 ${rankStyles[index] || 'bg-slate-100 text-slate-700'}`}>
                        {rankMedals[index] || `#${index + 1}`}
                      </div>
                      <div>
                        <div className="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition">
                          {v.student.full_name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                          <span className="bg-slate-200/80 px-2 py-0.5 rounded text-slate-700 font-semibold">{v.student.group_name}</span>
                          <span>•</span>
                          <span>Tel: {v.student.phone || 'Kiritilmagan'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                      <span className="bg-rose-100 text-rose-700 font-black px-3.5 py-1.5 rounded-xl text-xs sm:text-sm border border-rose-200 flex items-center gap-1.5">
                        <span>⚠️</span> {v.total_violations} marta qoidabuzarlik
                      </span>
                      <button className="bg-white group-hover:bg-blue-600 text-slate-700 group-hover:text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-300 group-hover:border-blue-600 shadow-sm transition flex items-center gap-1">
                        Ko'rish & Oqlash <span className="group-hover:translate-x-0.5 transition-transform">➜</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/starssa/history" className="text-blue-600 hover:text-blue-800 font-bold text-base hover:underline inline-flex items-center gap-1">
            Barcha davomat tarixini ko'rish ➜
          </Link>
        </div>

        {/* Modal: Alerts */}
        {selectedAlert && (
          <div 
            onClick={(e) => { if(e.target === e.currentTarget) setSelectedAlert(null); }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          >
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-slate-100">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <h2 className="text-xl font-bold text-rose-600">Qoidabuzarlik Holati</h2>
                </div>
                <button 
                  onClick={() => setSelectedAlert(null)} 
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold text-lg transition"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <p><strong>O'quvchi:</strong> {selectedAlert.student.full_name}</p>
                <p><strong>Holat:</strong> <span className="text-rose-600 font-semibold">{selectedAlert.reason}</span></p>
              </div>

              <h3 className="font-bold text-slate-800 text-sm mb-2">Tushuntirish xatlari va sabablari:</h3>
              <div className="overflow-y-auto flex-1 mb-4 border border-slate-200 p-3 rounded-2xl bg-slate-50/50">
                <ul className="space-y-2">
                  {selectedAlert.student.attendances.map((r: any) => (
                    <li key={r.id} className="p-3 border border-slate-200 bg-white rounded-xl shadow-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span suppressHydrationWarning className="font-bold text-xs text-slate-800">
                          📅 {formatUzDateShort(r.date)}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          r.status === 'KELMADI' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.status === 'KELMADI' ? 'Kelmagan' : 'Kechikkan'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600"><strong>Sabab:</strong> {r.note || 'Kiritilmagan'}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-auto pt-4 border-t border-slate-100">
                <p className="text-center text-xs text-slate-600 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  ⚠️ Rasmiy ogohlantirish chorasini faqat <strong>USTOZ</strong> hal qila oladi.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Top Violator Details & Excusing */}
        {selectedViolator && (
          <div 
            onClick={(e) => { if(e.target === e.currentTarget) setSelectedViolator(null); }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-slate-100 overflow-hidden">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-slate-900 text-white flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👤</span>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{selectedViolator.student.full_name}</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
                    <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded-md">
                      {selectedViolator.student.group_name}
                    </span>
                    {selectedViolator.student.phone && (
                      <a href={`tel:${selectedViolator.student.phone}`} className="hover:text-white underline font-semibold">
                        📞 {selectedViolator.student.phone}
                      </a>
                    )}
                    {selectedViolator.student.birth_date && (
                      <span suppressHydrationWarning>
                        🎂 {formatUzDateShort(selectedViolator.student.birth_date)}
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedViolator(null)} 
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-lg transition"
                >
                  ✕
                </button>
              </div>

              {/* Notice Banner */}
              {modalNotice && (
                <div className="mx-6 mt-4 p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <span>✅</span> {modalNotice}
                </div>
              )}

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-800 text-base">
                    Qoidabuzarlik holatlari (Oxirgi 1 oy)
                  </h3>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    Jami: {selectedViolator.records.length} ta
                  </span>
                </div>

                {selectedViolator.records.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="text-4xl mb-2">🎉</div>
                    <h4 className="text-base font-bold text-slate-800">Barcha qoidabuzarliklar oqlandi!</h4>
                    <p className="text-xs text-slate-500 mt-1">Ushbu o'quvchida faol qoidabuzarlik qaydlari qolmadi.</p>
                    <button
                      onClick={() => setSelectedViolator(null)}
                      className="mt-4 bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold"
                    >
                      Yopish
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {selectedViolator.records.map((r: any) => {
                      return (
                        <li key={r.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50 hover:bg-white transition-all shadow-xs">
                          <div className="flex justify-between items-center mb-2">
                            <span suppressHydrationWarning className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                              <span>📅</span> {formatUzDate(r.date)}
                            </span>
                            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                              r.status === 'KELMADI' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {r.status === 'KELMADI' ? '🔴 Kelmagan' : '🟡 Kechikkan'}
                            </span>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 mb-3">
                            <span className="font-bold text-slate-900">Sabab / Tushuntirish:</span>{' '}
                            <span className={r.note ? 'text-slate-800' : 'text-slate-400 italic'}>
                              {r.note || "Sabab kiritilmagan"}
                            </span>
                          </div>
                          
                          <div className="flex justify-end">
                            <button 
                              disabled={excusingId === r.id}
                              onClick={() => handleExcuse(r.id)} 
                              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-4 py-2 rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {excusingId === r.id ? (
                                <><span>⏳</span> Oqlanmoqda...</>
                              ) : (
                                <><span>✓</span> Bekor qilish (Oqlash)</>
                              )}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedViolator(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}