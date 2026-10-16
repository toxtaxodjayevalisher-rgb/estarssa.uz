"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import BirthdayBanner from '@/app/components/BirthdayBanner';
import DashboardLayout from '@/app/components/DashboardLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  return (
    <DashboardLayout role="ADMIN">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Maktab statistikasi va umumiy boshqaruv paneli</p>
          </div>
        </div>
        
        <BirthdayBanner />
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-bl-full"></div>
                <h3 className="text-slate-500 text-sm font-semibold mb-2">Jami o'quvchilar</h3>
                <p className="text-4xl font-extrabold text-slate-800">{stats?.totalStudents || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-green-500/10 rounded-bl-full"></div>
                <h3 className="text-slate-500 text-sm font-semibold mb-2">Eng yaxshi guruh</h3>
                <p className="text-2xl font-bold text-green-600 truncate">{stats?.groupRankings?.[0]?.name || 'Yo\'q'}</p>
                <p className="text-sm font-bold text-green-500 mt-1">{stats?.groupRankings?.[0]?.percentage || 0}% keldi</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-orange-500/10 rounded-bl-full"></div>
                <h3 className="text-slate-500 text-sm font-semibold mb-2">Hisobotlar</h3>
                <Link href="/admin/attendance" className="mt-2 inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-200 transition-colors">
                  Excel yuklab olish
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* CHART */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Oxirgi 7 kunlik davomat</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      <Bar dataKey="Keldi" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="Kelmadi" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="Sababli" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* REYTING */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Guruhlar Reytingi</h3>
                  <Link href="/admin/ratings" className="text-sm font-bold text-blue-600 hover:underline">Sertifikatlar &rarr;</Link>
                </div>
                <div className="space-y-4">
                  {stats?.groupRankings?.map((group: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-600' : idx === 1 ? 'bg-slate-200 text-slate-600' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white text-slate-400'}`}>
                          {idx + 1}
                        </div>
                        <span className="font-bold text-slate-700">{group.name}</span>
                      </div>
                      <span className={`font-bold ${group.percentage >= 80 ? 'text-green-600' : group.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {group.percentage}%
                      </span>
                    </div>
                  ))}
                  {(!stats?.groupRankings || stats.groupRankings.length === 0) && (
                    <p className="text-slate-400 text-center text-sm py-4">Hali ma'lumot yo'q</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
