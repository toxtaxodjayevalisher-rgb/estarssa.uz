"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

type Student = { id: string, full_name: string, group_name: string };
type AttendanceStatus = 'KELDI' | 'KECHIKIB_KELDI' | 'UZR_LI' | 'KELMADI';
type AttendanceRecord = { status: AttendanceStatus, note?: string };

export default function StarssaAttendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [groupName, setGroupName] = useState('IG2-26');

  useEffect(() => {
    fetch('/api/students')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStudents(data);
          if (data.length > 0 && data[0].group_name) {
            setGroupName(data[0].group_name);
          }
          const init: Record<string, AttendanceRecord> = {};
          data.forEach((s: Student) => init[s.id] = { status: 'KELDI' });
          setAttendance(init);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleStatusChange = (id: string, status: AttendanceStatus) => {
    setAttendance(prev => {
      let newNote = prev[id]?.note;
      if (status === 'KECHIKIB_KELDI') {
        newNote = newNote || new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      } else if (status === 'UZR_LI') {
        newNote = newNote || 'Sababli (kasal yoki ruxsat olgan)';
      } else if (status === 'KELMADI') {
        newNote = newNote || 'Sababsiz';
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
        ? (data.note?.trim() || 'Sababsiz') 
        : data.status === 'UZR_LI'
        ? (data.note?.trim() || 'Sababli')
        : data.status === 'KECHIKIB_KELDI'
        ? (data.note?.trim() || 'Kechikdi')
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
        alert("Davomat muvaffaqiyatli Ustozga tasdiqlash uchun yuborildi!");
        window.location.href = "/starssa";
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

  const counts = {
    keldi: Object.values(attendance).filter(a => a.status === 'KELDI').length,
    kechikdi: Object.values(attendance).filter(a => a.status === 'KECHIKIB_KELDI').length,
    uzrli: Object.values(attendance).filter(a => a.status === 'UZR_LI').length,
    kelmadi: Object.values(attendance).filter(a => a.status === 'KELMADI').length,
  };

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-slate-50 overflow-hidden font-sans">
      <div className="w-full md:w-64 bg-[#0a1128] text-white shadow-2xl z-20 flex flex-col flex-shrink-0">
        <div className="p-6 text-2xl font-bold border-b border-slate-700 text-center tracking-wider text-white">E-STARSSA</div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-3 md:p-4 space-x-2 md:space-x-0 md:space-y-2 border-b md:border-none border-slate-800">
          <Link href="/starssa" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium">Asosiy</Link>
          <Link href="/starssa/students" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium">O'quvchilar</Link>
          <Link href="/starssa/attendance" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 font-bold text-white">Davomat Qilish</Link>
          <Link href="/starssa/history" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium">Davomat Tarixi</Link>
          <Link href="/starssa/homework" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium">Uyga Vazifa</Link>
          <Link href="/starssa/announcements" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium">E'lonlar</Link>
        </nav>
        <div className="p-4 mt-auto border-t border-slate-800 hidden md:block">
          <Link href="/logout" className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-600 px-4 py-2.5 rounded-xl text-red-500 hover:text-white font-semibold transition-all">
            Chiqish
          </Link>
        </div>
      </div>

      <div className="flex-1 p-3 sm:p-6 md:p-8 overflow-y-auto text-slate-800 relative w-full">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Bugungi Davomat</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Sana: <span className="font-semibold text-slate-700">{new Date().toLocaleDateString('uz-UZ')}</span> | Guruh: <span className="font-semibold text-blue-600">{groupName}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              type="button"
              onClick={markAllPresent} 
              className="text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl font-medium transition-all"
            >
              ✓ Barchani "Keldi" qilish
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={submitting || loading}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all text-sm disabled:opacity-50"
            >
              {submitting ? 'Yuborilmoqda...' : 'Tasdiqlashga yuborish ➔'}
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
            <span className="text-xs font-semibold text-emerald-700">🟢 Keldi</span>
            <p className="text-xl sm:text-2xl font-bold text-emerald-800">{counts.keldi}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <span className="text-xs font-semibold text-amber-700">🟡 Kechikdi</span>
            <p className="text-xl sm:text-2xl font-bold text-amber-800">{counts.kechikdi}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
            <span className="text-xs font-semibold text-blue-700">🔵 Sababli</span>
            <p className="text-xl sm:text-2xl font-bold text-blue-800">{counts.uzrli}</p>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center">
            <span className="text-xs font-semibold text-rose-700">🔴 Kelmadi</span>
            <p className="text-xl sm:text-2xl font-bold text-rose-800">{counts.kelmadi}</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium">O'quvchilar yuklanmoqda...</div>
        ) : (
          <div className="space-y-2.5 pb-20">
            {students.map((s, idx) => {
              const currentStatus = attendance[s.id]?.status || 'KELDI';
              const currentNote = attendance[s.id]?.note || '';

              return (
                <div 
                  key={s.id} 
                  className={`p-3.5 sm:p-4 rounded-2xl bg-white border transition-all shadow-sm ${
                    currentStatus === 'KELDI' 
                      ? 'border-gray-200 hover:border-emerald-300' 
                      : currentStatus === 'KECHIKIB_KELDI'
                      ? 'border-amber-300 bg-amber-50/30'
                      : currentStatus === 'UZR_LI'
                      ? 'border-blue-300 bg-blue-50/30'
                      : 'border-rose-300 bg-rose-50/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Student Info */}
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 font-bold text-xs">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                          {s.full_name}
                        </h3>
                        <span className="text-xs text-gray-400 font-medium">{s.group_name}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-4 sm:flex items-center gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.id, 'KELDI')}
                        className={`py-1.5 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                          currentStatus === 'KELDI'
                            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 scale-102'
                            : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        Keldi
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.id, 'KECHIKIB_KELDI')}
                        className={`py-1.5 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                          currentStatus === 'KECHIKIB_KELDI'
                            ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30 scale-102'
                            : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                      >
                        Kechikdi
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.id, 'UZR_LI')}
                        className={`py-1.5 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                          currentStatus === 'UZR_LI'
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 scale-102'
                            : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                      >
                        Sababli
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.id, 'KELMADI')}
                        className={`py-1.5 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                          currentStatus === 'KELMADI'
                            ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30 scale-102'
                            : 'bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-700'
                        }`}
                      >
                        Kelmadi
                      </button>
                    </div>
                  </div>

                  {/* Note input if not present */}
                  {currentStatus !== 'KELDI' && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                        {currentStatus === 'KECHIKIB_KELDI' ? 'Kechikish vaqti:' : currentStatus === 'UZR_LI' ? 'Sababi:' : 'Izoh:'}
                      </span>
                      <input 
                        type={currentStatus === 'KECHIKIB_KELDI' ? 'text' : 'text'}
                        placeholder={
                          currentStatus === 'KECHIKIB_KELDI' 
                            ? 'Masalan: 08:35' 
                            : currentStatus === 'UZR_LI'
                            ? 'Sababini yozing (masalan: Shamollagan, shifokorda)...'
                            : 'Kelmadi sababi (masalan: Sababsiz)...'
                        }
                        value={currentNote}
                        onChange={(e) => handleNoteChange(s.id, e.target.value)}
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs sm:text-sm text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
