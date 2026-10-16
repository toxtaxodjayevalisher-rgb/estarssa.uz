"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { formatUzDateShort } from '@/lib/date';
import DashboardLayout from '@/app/components/DashboardLayout';

type Student = { id: string, full_name: string, group_name: string };
type AttendanceStatus = 'KELDI' | 'KECHIKIB_KELDI' | 'UZR_LI' | 'KELMADI';
type AttendanceRecord = { status: AttendanceStatus, note?: string };

export default function StarssaAttendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reverting, setReverting] = useState(false);
  const [groupName, setGroupName] = useState('IG2-26');
  const [sessionStatus, setSessionStatus] = useState<string>('Boshlanmagan');
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/students').then(r => r.json()),
      fetch('/api/attendance/stats').then(r => r.json())
    ]).then(([studentsData, statsData]) => {
      if (Array.isArray(studentsData)) {
        setStudents(studentsData);
        if (studentsData.length > 0 && studentsData[0].group_name) {
          setGroupName(studentsData[0].group_name);
        }
        const init: Record<string, AttendanceRecord> = {};
        studentsData.forEach((s: Student) => init[s.id] = { status: 'KELDI' });
        
        if (statsData && statsData.records && statsData.records.length > 0) {
          statsData.records.forEach((r: any) => {
            init[r.student_id] = { status: r.status, note: r.note || '' };
          });
        }
        setAttendance(init);
      }

      if (statsData && statsData.status) {
        setSessionStatus(statsData.status);
        setSessionId(statsData.session_id || null);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleStatusChange = (id: string, status: AttendanceStatus) => {
    setAttendance(prev => {
      let newNote = prev[id]?.note;
      if (status === 'KECHIKIB_KELDI') {
        newNote = newNote || new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      } else if (status === 'UZR_LI') {
        newNote = newNote || 'kasal';
      } else if (status === 'KELMADI') {
        newNote = newNote || 'sababsiz';
      } else {
        newNote = undefined;
      }
      return { ...prev, [id]: { status, note: newNote } };
    });
  };

  const handleNoteChange = (id: string, note: string) => {
    setAttendance(prev => ({ ...prev, [id]: { ...prev[id], note } }));
  };

  const markAllPresent = () => {
    const next: Record<string, AttendanceRecord> = {};
    students.forEach(s => {
      next[s.id] = { status: 'KELDI' };
    });
    setAttendance(next);
  };

  const handleSubmit = async () => {
    if (students.length === 0) return alert("O'quvchilar ro'yxati topilmadi");

    const records = Object.entries(attendance).map(([student_id, data]) => ({
      student_id,
      status: data.status,
      note: data.status === 'KELMADI' 
        ? (data.note?.trim() || 'sababsiz') 
        : data.status === 'UZR_LI'
        ? (data.note?.trim() || 'kasal')
        : data.status === 'KECHIKIB_KELDI'
        ? (data.note?.trim() || 'kechikdi')
        : null
    }));

    setSubmitting(true);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString(),
          group_name: groupName || students[0]?.group_name || 'IG2-26',
          records,
          submit: true
        })
      });
      if (res.ok) {
        const data = await res.json();
        alert("Davomat muvaffaqiyatli Ustozga tasdiqlash uchun va Telegramga yuborildi!");
        setSessionStatus('SENT_FOR_APPROVAL');
        if (data.session?.id) setSessionId(data.session.id);
      } else {
        const data = await res.json();
        alert("Xatolik yuz berdi: " + (data.error || "Noma'lum xato"));
      }
    } catch (e) {
      alert("Aloqa xatosi yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAttendance = async () => {
    if (!sessionId) {
      alert("Davomat ID topilmadi. Sahifani yangilang!");
      return;
    }
    if (!confirm("Haqiqatan ham bugungi davomatni bekor qilib, qaytadan qilmoqchimisiz?")) return;

    setReverting(true);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit_draft', session_id: sessionId })
      });
      if (res.ok) {
        alert("Davomat bekor qilindi. Endi qayta davomat qilishingiz mumkin!");
        setSessionStatus('DRAFT');
      } else {
        const text = await res.text();
        alert("Server xatosi: " + text);
      }
    } catch (e: any) {
      alert("Xatolik: " + e.message);
    } finally {
      setReverting(false);
    }
  };

  const counts = {
    keldi: Object.values(attendance).filter(a => a.status === 'KELDI').length,
    kechikdi: Object.values(attendance).filter(a => a.status === 'KECHIKIB_KELDI').length,
    uzrli: Object.values(attendance).filter(a => a.status === 'UZR_LI').length,
    kelmadi: Object.values(attendance).filter(a => a.status === 'KELMADI').length,
  };

  const isLocked = sessionStatus === 'SENT_FOR_APPROVAL' || sessionStatus === 'APPROVED';

  return (
    <DashboardLayout role="STARSSA">
      <div className="max-w-4xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">📋</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Bugungi Davomat</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-2">
              <span>Sana:</span>
              <span suppressHydrationWarning className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                {formatUzDateShort()}
              </span>
              <span>•</span>
              <span>Guruh:</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {groupName}
              </span>
            </p>
          </div>
          {!isLocked && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                type="button"
                onClick={markAllPresent} 
                className="w-full sm:w-auto text-xs sm:text-sm bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>✓</span>
                <span>Barchani "Keldi" qilish</span>
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500 font-medium flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>O'quvchilar ro'yxati yuklanmoqda...</span>
          </div>
        ) : isLocked ? (
          /* Agar davomat qilinib bo'lgan bo'lsa - Yopiladi va Bekor qilish tugmasi chiqadi */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm max-w-xl mx-auto my-6 text-center animate-in fade-in">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl border border-amber-200 shadow-sm">
              🔒
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
              Bugungi davomat tasdiqlash uchun yuborilgan
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mb-6 leading-relaxed">
              Bugungi davomat ustozga jo'natilganligi sababli davomat qilish vaqtincha yopib qo'yildi.
              <br /><br />
              <span className="text-rose-600 font-semibold block text-base bg-rose-50 p-3 rounded-xl border border-rose-200">
                Davomat qilish uchun uni bekor qiling
              </span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCancelAttendance}
                disabled={reverting}
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-md shadow-rose-600/20 active:scale-95 transition-all text-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {reverting ? 'Bekor qilinmoqda...' : '⚠️ Davomatni bekor qilish va qaytadan qilish'}
              </button>
              <Link
                href="/starssa"
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-3.5 rounded-xl transition-all text-sm text-center"
              >
                Asosiy sahifaga qaytish
              </Link>
            </div>
          </div>
        ) : (
          /* Davomat qilish ochiq bo'lgan holat */
          <div>
            {/* Live Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-5">
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3 sm:p-4 text-center shadow-xs">
                <span className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">🟢 Keldi</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 mt-1">{counts.keldi}</p>
              </div>
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 sm:p-4 text-center shadow-xs">
                <span className="text-xs font-bold text-amber-700 flex items-center justify-center gap-1">🟡 Kechikdi</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-800 mt-1">{counts.kechikdi}</p>
              </div>
              <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3 sm:p-4 text-center shadow-xs">
                <span className="text-xs font-bold text-blue-700 flex items-center justify-center gap-1">🔵 Sababli</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-800 mt-1">{counts.uzrli}</p>
              </div>
              <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-3 sm:p-4 text-center shadow-xs">
                <span className="text-xs font-bold text-rose-700 flex items-center justify-center gap-1">🔴 Kelmadi</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-rose-800 mt-1">{counts.kelmadi}</p>
              </div>
            </div>

            <div className="space-y-3 pb-8">
              {students.map((s, idx) => {
                const currentStatus = attendance[s.id]?.status || 'KELDI';
                const currentNote = attendance[s.id]?.note || '';

                return (
                  <div 
                    key={s.id} 
                    className={`p-3.5 sm:p-4 rounded-2xl bg-white border transition-all duration-150 shadow-sm ${
                      currentStatus === 'KELDI' 
                        ? 'border-slate-200 hover:border-emerald-300' 
                        : currentStatus === 'KECHIKIB_KELDI'
                        ? 'border-amber-300 bg-amber-50/20'
                        : currentStatus === 'UZR_LI'
                        ? 'border-blue-300 bg-blue-50/20'
                        : 'border-rose-300 bg-rose-50/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Student Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-extrabold text-xs">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug truncate">
                            {s.full_name}
                          </h3>
                          <span className="text-xs text-slate-400 font-medium">{s.group_name}</span>
                        </div>
                      </div>

                      {/* Action Buttons: 4 tactile buttons designed for thumb tap */}
                      <div className="grid grid-cols-4 sm:flex items-center gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'KELDI')}
                          className={`h-10 sm:h-9 px-2 sm:px-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1 ${
                            currentStatus === 'KELDI'
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-600/30'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <span>✓</span>
                          <span>Keldi</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'KECHIKIB_KELDI')}
                          className={`h-10 sm:h-9 px-2 sm:px-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1 ${
                            currentStatus === 'KECHIKIB_KELDI'
                              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-500/30'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          <span>⏱</span>
                          <span>Kechikdi</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'UZR_LI')}
                          className={`h-10 sm:h-9 px-2 sm:px-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1 ${
                            currentStatus === 'UZR_LI'
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-600/30'
                              : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                        >
                          <span>🏥</span>
                          <span>Sababli</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'KELMADI')}
                          className={`h-10 sm:h-9 px-2 sm:px-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1 ${
                            currentStatus === 'KELMADI'
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-600/30'
                              : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                        >
                          <span>✕</span>
                          <span>Kelmadi</span>
                        </button>
                      </div>
                    </div>

                    {/* Note input if not present */}
                    {currentStatus !== 'KELDI' && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                        <span className="text-xs font-bold text-slate-600 whitespace-nowrap flex items-center gap-1">
                          {currentStatus === 'KECHIKIB_KELDI' ? '⏱ Kechikish vaqti:' : currentStatus === 'UZR_LI' ? '🏥 Sababi:' : '✕ Izoh:'}
                        </span>
                        <input 
                          type="text"
                          placeholder={
                            currentStatus === 'KECHIKIB_KELDI' 
                              ? 'Masalan: 08:35' 
                              : currentStatus === 'UZR_LI'
                              ? 'Sababini yozing (masalan: kasal)...'
                              : 'Kelmadi sababi (masalan: sababsiz)...'
                          }
                          value={currentNote}
                          onChange={(e) => handleNoteChange(s.id, e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* O'quvchilar ro'yxati oxiridagi Tasdiqlashga yuborish tugmasi */}
              <div className="pt-6 pb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm mt-4">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <span>🚀</span> Davomatni yakunlash
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Barcha o'quvchilar belgilanganini tekshirib, tasdiqlash uchun yuboring.
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={handleSubmit} 
                  disabled={submitting || loading}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-600/25 active:scale-95 transition-all text-base disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Yuborilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <span>Tasdiqlash uchun yuborish</span>
                      <span>➔</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
