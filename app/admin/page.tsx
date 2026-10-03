"use client";
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-700 text-center">E-STARSSA</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block px-4 py-2 bg-blue-600 rounded">Asosiy</Link>
          <Link href="/admin/students" className="block px-4 py-2 hover:bg-slate-800 rounded">O'quvchilar</Link>
          <Link href="/admin/attendance" className="block px-4 py-2 hover:bg-slate-800 rounded">Davomat</Link>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <p className="text-sm">Akkaunt: Admin</p>
          <button className="mt-2 w-full bg-red-600 px-4 py-2 rounded text-white text-sm" onClick={() => {
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
