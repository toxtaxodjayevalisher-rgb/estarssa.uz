"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Logout() {
  const router = useRouter();
  useEffect(() => {
    fetch('/api/auth/logout', { method: 'POST' }).then(() => router.push('/login'));
  }, [router]);
  return <div className="p-8 text-center font-bold">Tizimdan chiqilmoqda...</div>;
}
