"use client";
import Link from 'next/link';
import AnnouncementsClient from '@/app/components/AnnouncementsClient';

export default function AnnouncementsPage() {
  return (

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
          <Link href="/starssa" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Asosiy</Link>
          <Link href="/starssa/students" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">O'quvchilar</Link>
          <Link href="/starssa/attendance" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Davomat Qilish</Link>
          <Link href="/starssa/history" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Davomat Tarixi</Link>
          <Link href="/starssa/homework" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Uyga Vazifa</Link>
        
          <Link href="/starssa/announcements" className="block flex-shrink-0 whitespace-nowrap text-sm md:text-base px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all transform hover:scale-[1.02] text-white">E'lonlar</Link>
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
      <AnnouncementsClient role="STARSSA" />
    </div>
    </div>
  );
}
