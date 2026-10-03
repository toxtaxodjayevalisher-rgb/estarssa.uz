"use client";
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-[#0a1128] text-white shadow-2xl z-10 flex flex-col">
        <div className="p-6 text-3xl font-serif font-bold border-b border-slate-700 text-center tracking-wider text-white" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.4)' }}>E-STARSSA</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block px-4 py-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all transform hover:scale-[1.02]">Asosiy</Link>
          <Link href="/admin/students" className="block px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">O'quvchilar</Link>
          <Link href="/admin/attendance" className="block px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-gray-300 hover:text-white font-medium hover:translate-x-1">Davomat</Link>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <p className="text-sm">Akkaunt: Admin</p>
          <button className="mt-2 w-full bg-red-600 px-4 py-3 rounded-xl text-white font-bold active:scale-95 transition-all shadow-md shadow-red-500/30 hover:bg-red-700 text-sm" onClick={() => {
            fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/login');
          }}>Chiqish</button>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-y-auto text-black">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-semibold">Jami o'quvchilar</h3>
            <p className="text-3xl font-bold mt-2">125</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-semibold">Bugun kelganlar</h3>
            <p className="text-3xl font-bold mt-2">115</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
            <h3 className="text-gray-500 text-sm font-semibold">Kelmaganlar</h3>
            <p className="text-3xl font-bold mt-2">10</p>
          </div>
        </div>
      </div>
    </div>
  );
}
