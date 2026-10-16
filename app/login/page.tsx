"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Login yoki parol noto'g'ri");
        setLoading(false);
      } else {
        router.push(`/${data.role.toLowerCase()}`);
      }
    } catch {
      setError("Server bilan bog'lanishda xatolik yuz berdi");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-br from-[#070c1e] via-[#0a1128] to-[#0d1838] p-4 sm:p-6 text-slate-100 antialiased font-sans relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/25 mb-3">
            <span className="text-2xl">⭐</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-wider text-white">
            E-STARSSA
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5 font-medium">
            Maktab Sardorlari va Ustozlar boshqaruv portali
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white text-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
            Tizimga kirish
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-5">
            O'z login va parolingizni kiriting
          </p>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
              <span className="text-base flex-shrink-0">⚠️</span>
              <span className="font-medium leading-tight">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Login
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  👤
                </span>
                <input 
                  type="text" 
                  autoComplete="username"
                  required
                  placeholder="Loginni kiriting"
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Parol
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  🔒
                </span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  autoComplete="current-password"
                  required
                  placeholder="Parolni kiriting"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white py-3.5 px-4 rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all flex justify-center items-center gap-2 disabled:opacity-60 cursor-pointer text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Tekshirilmoqda...</span>
                  </>
                ) : (
                  <>
                    <span>Kirish</span>
                    <span>➔</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} E-STARSSA. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    </div>
  );
}