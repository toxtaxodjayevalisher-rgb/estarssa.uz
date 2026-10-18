"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

type Role = 'STARSSA' | 'USTOZ' | 'ADMIN';

type NavItem = {
  href: string;
  label: string;
  shortLabel?: string;
  icon: string;
  badge?: number;
};

const navItemsByRole: Record<Role, NavItem[]> = {
  STARSSA: [
    { href: '/starssa', label: 'Asosiy', shortLabel: 'Asosiy', icon: '🏠' },
    { href: '/starssa/attendance', label: 'Davomat Qilish', shortLabel: 'Davomat', icon: '📋' },
    { href: '/starssa/history', label: 'Davomat Tarixi', shortLabel: 'Tarix', icon: '📜' },
    { href: '/starssa/homework', label: 'Uyga Vazifa', shortLabel: 'Vazifa', icon: '📚' },
    { href: '/starssa/students', label: "O'quvchilar", shortLabel: "O'quvchi", icon: '👥' },
    { href: '/starssa/announcements', label: "E'lonlar", shortLabel: "E'lon", icon: '📢' },
    { href: '/starssa/anonymous-messages', label: "Anonim Xabarlar", shortLabel: "Anonim", icon: '🕵️' },
  ],
  USTOZ: [
    { href: '/ustoz', label: 'Asosiy', shortLabel: 'Asosiy', icon: '🏠' },
    { href: '/ustoz/approve', label: 'Tasdiqlash', shortLabel: 'Tasdiqlash', icon: '✓' },
    { href: '/ustoz/students', label: "O'quvchilar", shortLabel: "O'quvchi", icon: '👥' },
    { href: '/ustoz/history', label: 'Davomat Tarixi', shortLabel: 'Tarix', icon: '📜' },
    { href: '/ustoz/announcements', label: "E'lonlar", shortLabel: "E'lon", icon: '📢' },
  ],
  ADMIN: [
    { href: '/admin', label: 'Asosiy', shortLabel: 'Asosiy', icon: '🏠' },
    { href: '/admin/students', label: "O'quvchilar", shortLabel: "O'quvchi", icon: '👥' },
    { href: '/admin/attendance', label: 'Davomat', shortLabel: 'Davomat', icon: '📋' },
    { href: '/admin/users', label: 'Akkauntlar', shortLabel: 'Akkaunt', icon: '🔑' },
    { href: '/admin/ratings', label: 'Reyting & Sertifikat', shortLabel: 'Reyting', icon: '🏆' },
    { href: '/admin/announcements', label: "E'lonlar", shortLabel: "E'lon", icon: '📢' },
  ]
};

export default function DashboardLayout({
  role,
  children,
  pendingBadge
}: {
  role: Role;
  children: React.ReactNode;
  pendingBadge?: number;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const hideNetlify = () => {
      document.querySelectorAll('a, div, iframe').forEach((el) => {
        if (
          el.textContent?.includes('Powered by Netlify') ||
          (el instanceof HTMLAnchorElement && el.href.includes('netlify.com')) ||
          el.id?.toLowerCase().includes('netlify') ||
          el.className?.toString().toLowerCase().includes('netlify')
        ) {
          (el as HTMLElement).style.setProperty('display', 'none', 'important');
          (el as HTMLElement).style.setProperty('opacity', '0', 'important');
          (el as HTMLElement).style.setProperty('pointer-events', 'none', 'important');
          (el as HTMLElement).style.setProperty('visibility', 'hidden', 'important');
        }
      });
    };
    hideNetlify();
    const interval = setInterval(hideNetlify, 1000);
    return () => clearInterval(interval);
  }, []);

  const items = navItemsByRole[role] || [];

  // Bottom bar has up to 4 main items + 1 Menu button
  const bottomItems = items.slice(0, 4);

  const roleLabel = role === 'STARSSA' ? 'Starssa' : role === 'USTOZ' ? 'Ustoz' : 'Admin';
  const roleBadgeColor = role === 'STARSSA' 
    ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' 
    : role === 'USTOZ' 
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' 
    : 'bg-purple-500/20 text-purple-300 border-purple-400/30';

  return (
    <div className="min-h-[100dvh] md:h-[100dvh] flex flex-col md:flex-row bg-slate-50 text-slate-800 font-sans antialiased">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex w-64 bg-[#0a1128] text-white shadow-2xl z-30 flex-col flex-shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <span className="text-2xl font-serif font-black tracking-wider text-white" style={{ textShadow: '0 2px 8px rgba(255,255,255,0.3)' }}>
              E-STARSSA
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${roleBadgeColor}`}>
              {roleLabel} Kabineti
            </span>
            <span className="text-xs text-slate-400 font-medium">v2.0</span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href;
            const hasBadge = item.href.includes('approve') && pendingBadge && pendingBadge > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 translate-x-1'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 hover:translate-x-1'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {hasBadge ? (
                  <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
                    {pendingBadge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Logout Button */}
        <div className="p-4 border-t border-slate-800">
          <Link
            href="/logout"
            className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all group cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Tizimdan chiqish
          </Link>
        </div>
      </aside>

      {/* ================= MOBILE STICKY TOP BAR ================= */}
      <header className="md:hidden sticky top-0 z-30 bg-[#0a1128]/95 backdrop-blur-md text-white border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md">
        <Link href={`/${role.toLowerCase()}`} className="flex items-center gap-2">
          <span className="text-xl">⭐</span>
          <span className="text-xl font-serif font-black tracking-wider text-white">E-STARSSA</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${roleBadgeColor}`}>
            {roleLabel}
          </span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Menyuni ochish"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white font-bold transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* ================= MOBILE SLIDE-OUT DRAWER ================= */}
      {mobileMenuOpen && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setMobileMenuOpen(false); }}
          className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end animate-fadeIn"
        >
          <div className="w-[82%] max-w-sm bg-[#0a1128] text-white h-full flex flex-col shadow-2xl p-5 border-l border-slate-800">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">⭐</span>
                  <span className="font-serif font-black text-lg">E-STARSSA</span>
                </div>
                <span className="text-xs text-slate-400">{roleLabel} boshqaruv paneli</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Drawer Links */}
            <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
              {items.map((item) => {
                const isActive = pathname === item.href;
                const hasBadge = item.href.includes('approve') && pendingBadge && pendingBadge > 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition active:scale-95 ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {hasBadge && (
                      <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        {pendingBadge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Drawer Logout */}
            <div className="pt-4 border-t border-slate-800 mt-auto">
              <Link
                href="/logout"
                className="w-full flex items-center justify-center gap-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white px-4 py-3 rounded-xl text-sm font-bold transition active:scale-95"
              >
                Tizimdan chiqish
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-40 md:pb-8 relative w-full">
        {children}
      </main>

      {/* ================= MOBILE BOTTOM NAVIGATION BAR ================= */}
      <nav className="md:hidden fixed bottom-[72px] left-3 right-3 z-40 bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-2 py-2 rounded-2xl flex items-center justify-around">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          const hasBadge = item.href.includes('approve') && pendingBadge && pendingBadge > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive 
                  ? 'text-blue-600 font-extrabold' 
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <span className="text-lg leading-none">{item.icon}</span>
                {hasBadge && (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {pendingBadge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight font-medium">
                {item.shortLabel || item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5"></span>
              )}
            </Link>
          );
        })}

        {/* 5th Button: Full Menu Trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            mobileMenuOpen ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <span className="text-lg leading-none">☰</span>
          <span className="text-[11px] mt-0.5 tracking-tight font-medium">Menyu</span>
        </button>
      </nav>
    </div>
  );
}
