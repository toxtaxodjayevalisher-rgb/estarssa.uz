"use client";
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';

type Attendance = { status: string, note: string | null };
type Student = { 
  id: string, 
  full_name: string, 
  group_name: string, 
  phone: string | null, 
  birth_date: string | null,
  attendances: Attendance[] 
};

export default function StarssaStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: '', full_name: '', group_name: '', phone: '', birth_date: '' });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Telegram messaging state
  const [selectedStudentForMsg, setSelectedStudentForMsg] = useState<Student | null>(null);
  const [msgText, setMsgText] = useState('');
  const [msgTarget, setMsgTarget] = useState<'group' | 'direct'>('group');
  const [msgSending, setMsgSending] = useState(false);
  const [msgToast, setMsgToast] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setStudents(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? 'PUT' : 'POST';
    const res = await fetch('/api/students', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      const savedStudent = await res.json();
      if (formData.id) {
        setStudents(students.map(s => s.id === savedStudent.id ? savedStudent : s));
      } else {
        setStudents([savedStudent, ...students]);
      }
      setShowForm(false);
      setFormData({ id: '', full_name: '', group_name: '', phone: '', birth_date: '' });
    }
  };

  const editStudent = (s: Student) => {
    setFormData({
      id: s.id,
      full_name: s.full_name,
      group_name: s.group_name,
      phone: s.phone || '',
      birth_date: s.birth_date ? s.birth_date.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleSendMessage = async () => {
    if (!selectedStudentForMsg || !msgText.trim()) return;
    setMsgSending(true);
    setMsgToast(null);

    try {
      const res = await fetch('/api/starssa/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudentForMsg.id,
          message: msgText.trim(),
          target: msgTarget
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setMsgToast({ type: 'error', text: data.error || "Xabar yuborishda xatolik yuz berdi" });
      } else {
        setMsgToast({ type: 'success', text: `Xabar muvaffaqiyatli ${data.sent_to} yuborildi!` });
        setTimeout(() => {
          setSelectedStudentForMsg(null);
          setMsgText('');
          setMsgToast(null);
        }, 1500);
      }
    } catch (err: any) {
      setMsgToast({ type: 'error', text: "Tarmoq xatosi yuz berdi" });
    } finally {
      setMsgSending(false);
    }
  };

  const filtered = students.filter(s => 
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.group_name && s.group_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout role="STARSSA">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>👥</span> O'quvchilar ro'yxati
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Guruhdagi o'quvchilar ma'lumotlari va davomat statistikasi ({students.length} ta o'quvchi)
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              type="button"
              onClick={() => {
                setFormData({ id: '', full_name: '', group_name: students[0]?.group_name || '', phone: '', birth_date: '' });
                setShowForm(true);
              }} 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-blue-500/20 text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>+</span>
              <span>Yangi o'quvchi</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-5">
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="F.I.SH. bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500 font-medium flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>O'quvchilar yuklanmoqda...</span>
          </div>
        ) : (
          <div>
            {/* Mobile Card List (< md) */}
            <div className="md:hidden space-y-3 pb-8">
              {filtered.map((s, idx) => {
                const kech = s.attendances?.filter(a => a.status === 'KECHIKIB_KELDI').length || 0;
                const sababsiz = s.attendances?.filter(a => a.status === 'KELMADI').length || 0;
                const sababli = s.attendances?.filter(a => a.status === 'UZR_LI').length || 0;

                return (
                  <div key={s.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 font-extrabold text-xs">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug truncate">
                            {s.full_name}
                          </h3>
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                            {s.group_name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentForMsg(s);
                            setMsgText('');
                            setMsgToast(null);
                          }}
                          className="text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 px-2.5 py-1.5 rounded-lg transition active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <span>💬</span>
                          <span>Telegram</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => editStudent(s)}
                          className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition active:scale-95 cursor-pointer"
                        >
                          ✏️
                        </button>
                      </div>
                    </div>

                    {/* Stats pills */}
                    <div className="grid grid-cols-3 gap-2 my-3 pt-2.5 border-t border-slate-100 text-center">
                      <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2">
                        <span className="text-[10px] font-bold text-amber-700 block">Kech qolgan</span>
                        <span className="text-sm font-extrabold text-amber-800">{kech} ta</span>
                      </div>
                      <div className="bg-rose-50/70 border border-rose-200/60 rounded-xl p-2">
                        <span className="text-[10px] font-bold text-rose-700 block">Sababsiz</span>
                        <span className="text-sm font-extrabold text-rose-800">{sababsiz} ta</span>
                      </div>
                      <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-2">
                        <span className="text-[10px] font-bold text-blue-700 block">Sababli</span>
                        <span className="text-sm font-extrabold text-blue-800">{sababli} ta</span>
                      </div>
                    </div>

                    {/* Phone and Birth date */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div>
                        {s.birth_date ? (
                          <span>🎂 {new Date(s.birth_date).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-slate-400">Tug'ilgan sana yo'q</span>
                        )}
                      </div>
                      <div>
                        {s.phone ? (
                          <a 
                            href={`tel:${s.phone.replace(/\s/g, '')}`} 
                            className="font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg inline-flex items-center gap-1 active:scale-95"
                          >
                            📞 {s.phone}
                          </a>
                        ) : (
                          <span className="text-slate-400">Telefon yo'q</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="bg-white p-8 rounded-2xl text-center text-slate-400 font-medium border border-slate-200">
                  O'quvchi topilmadi
                </div>
              )}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
              <div className="overflow-x-auto w-full">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-5 py-3.5 font-bold text-slate-600 uppercase text-xs w-12">#</th>
                      <th className="text-left px-5 py-3.5 font-bold text-slate-600 uppercase text-xs">F.I.SH.</th>
                      <th className="text-left px-5 py-3.5 font-bold text-slate-600 uppercase text-xs">Guruh</th>
                      <th className="text-left px-5 py-3.5 font-bold text-slate-600 uppercase text-xs">Tug'ilgan sana</th>
                      <th className="text-left px-5 py-3.5 font-bold text-slate-600 uppercase text-xs">Telefon</th>
                      <th className="text-center px-4 py-3.5 font-bold text-slate-600 uppercase text-xs">Kech</th>
                      <th className="text-center px-4 py-3.5 font-bold text-slate-600 uppercase text-xs">Sababsiz</th>
                      <th className="text-center px-4 py-3.5 font-bold text-slate-600 uppercase text-xs">Sababli</th>
                      <th className="text-right px-5 py-3.5 font-bold text-slate-600 uppercase text-xs">Harakatlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((s, idx) => {
                      const kech = s.attendances?.filter(a => a.status === 'KECHIKIB_KELDI').length || 0;
                      const sababsiz = s.attendances?.filter(a => a.status === 'KELMADI').length || 0;
                      const sababli = s.attendances?.filter(a => a.status === 'UZR_LI').length || 0;

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5 text-slate-400 font-bold text-xs">{idx + 1}</td>
                          <td className="px-5 py-3.5 font-bold text-slate-900">{s.full_name}</td>
                          <td className="px-5 py-3.5">
                            <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md text-xs">
                              {s.group_name}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 text-xs">
                            {s.birth_date ? new Date(s.birth_date).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-5 py-3.5">
                            {s.phone ? (
                              <a href={`tel:${s.phone.replace(/\s/g, '')}`} className="text-blue-600 hover:underline font-medium text-xs">
                                {s.phone}
                              </a>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center font-bold text-amber-600 text-xs">{kech}</td>
                          <td className="px-4 py-3.5 text-center font-bold text-rose-600 text-xs">{sababsiz}</td>
                          <td className="px-4 py-3.5 text-center font-bold text-emerald-600 text-xs">{sababli}</td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button 
                                type="button"
                                onClick={() => {
                                  setSelectedStudentForMsg(s);
                                  setMsgText('');
                                  setMsgToast(null);
                                }}
                                className="text-sky-600 hover:text-sky-800 font-bold text-xs bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition active:scale-95 cursor-pointer flex items-center gap-1"
                              >
                                <span>💬</span>
                                <span>Telegram</span>
                              </button>
                              <button 
                                onClick={() => editStudent(s)} 
                                className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition active:scale-95 cursor-pointer"
                              >
                                Tahrirlash
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-medium">
                          O'quvchilar yo'q
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Telegram Message Modal */}
        {selectedStudentForMsg && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center text-xl font-bold">
                    ✈️
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                      O'quvchiga Telegram orqali xabar
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {selectedStudentForMsg.full_name} ({selectedStudentForMsg.group_name})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudentForMsg(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {msgToast && (
                <div className={`p-3 rounded-xl mb-3 text-xs font-medium flex items-center gap-2 ${
                  msgToast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  <span>{msgToast.type === 'success' ? '✅' : '⚠️'}</span>
                  <span>{msgToast.text}</span>
                </div>
              )}

              {/* Target selector */}
              <div className="space-y-2 mb-3.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Xabar yuborish usuli
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMsgTarget('group')}
                    className={`p-3 rounded-xl text-left border transition text-xs font-semibold cursor-pointer ${
                      msgTarget === 'group'
                        ? 'bg-sky-50 border-sky-500 text-sky-800 ring-2 ring-sky-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 mb-0.5">
                      <span>👥</span>
                      <span>Guruhga yuborish</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">
                      O'quvchilar guruhiga uning nomini belgilab jo'natadi
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMsgTarget('direct')}
                    className={`p-3 rounded-xl text-left border transition text-xs font-semibold cursor-pointer ${
                      msgTarget === 'direct'
                        ? 'bg-sky-50 border-sky-500 text-sky-800 ring-2 ring-sky-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 mb-0.5">
                      <span>👤</span>
                      <span>Shaxsiy (Lichka)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">
                      O'quvchining shaxsiy Telegramiga bot orqali
                    </p>
                  </button>
                </div>
              </div>

              {/* Quick message templates */}
              <div className="space-y-1.5 mb-3.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tezkor andozalar
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "⚠️ Darsga kechikmasdan, o'z vaqtida keling!",
                    "📚 Ertangi uyga vazifani bajarib keling!",
                    "📞 Darsdan so'ng kurator xonasiga uchrashing!",
                    "📝 Dars qoldirish sababini ma'lum qiling!"
                  ].map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMsgText(tmpl)}
                      className="text-[11px] bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 px-2.5 py-1 rounded-lg transition font-medium cursor-pointer"
                    >
                      {tmpl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message textarea */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Xabar matni *
                </label>
                <textarea
                  rows={3}
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  placeholder="O'quvchiga yubormoqchi bo'lgan xabaringizni yozing..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForMsg(null)}
                  className="px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-sm transition cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  disabled={msgSending || !msgText.trim()}
                  onClick={handleSendMessage}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md shadow-sky-500/20 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {msgSending ? (
                    <span>Yuborilmoqda...</span>
                  ) : (
                    <>
                      <span>Yuborish</span>
                      <span>✈️</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {formData.id ? 'O\'quvchini tahrirlash' : 'Yangi o\'quvchi qo\'shish'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    F.I.SH. *
                  </label>
                  <input 
                    required 
                    placeholder="Masalan: Saidov Yodgor" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                    value={formData.full_name} 
                    onChange={e => setFormData({...formData, full_name: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Guruh *
                  </label>
                  <input 
                    required 
                    placeholder="Masalan: IG2-26" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                    value={formData.group_name} 
                    onChange={e => setFormData({...formData, group_name: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tug'ilgan sana
                  </label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                    value={formData.birth_date} 
                    onChange={e => setFormData({...formData, birth_date: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Telefon raqam
                  </label>
                  <input 
                    placeholder="+998 90 123 45 67" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-sm transition cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 active:scale-95 transition cursor-pointer"
                  >
                    Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
