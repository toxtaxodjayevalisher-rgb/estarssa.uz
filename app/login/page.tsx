"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    
    if (!res.ok) {
      setError(data.error);
    } else {
      router.push(`/${data.role.toLowerCase()}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">E-STARSSA</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">Login</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full border p-2 rounded mt-1 text-black" required />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">Parol</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2 rounded mt-1 text-black" required />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Kirish</button>
      </form>
    </div>
  );
}