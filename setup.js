const fs = require('fs');
const path = require('path');

const files = {
  'lib/prisma.ts': `
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
`,
  'lib/auth.ts': `
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function verifyAuth() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as any;
  } catch (err) {
    return null;
  }
}
`,
  'app/api/auth/login/route.ts': `
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    const user = await prisma.user.findUnique({ where: { username } });
    
    if (!user) return NextResponse.json({ error: 'Login yoki parol noto\\'g\\'ri' }, { status: 401 });
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return NextResponse.json({ error: 'Login yoki parol noto\\'g\\'ri' }, { status: 401 });
    
    const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
    
    cookies().set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
    
    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
`,
  'app/api/auth/logout/route.ts': `
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  cookies().delete('token');
  return NextResponse.json({ success: true });
}
`,
  'middleware.ts': `
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') || pathname.startsWith('/starssa') || pathname.startsWith('/ustoz')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Yana ham aniqroq role-based tekshiruvni sahifa ichida yoki server componentda qilish mumkin
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/starssa/:path*', '/ustoz/:path*'],
};
`,
  'app/login/page.tsx': `
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
      router.push(\`/\${data.role.toLowerCase()}\`);
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
`,
  'prisma/seed.ts': `
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const password_hash = await bcrypt.hash('123456', 10);
  
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password_hash, role: 'ADMIN', full_name: 'Asosiy Admin' }
  });

  await prisma.user.upsert({
    where: { username: 'starssa' },
    update: {},
    create: { username: 'starssa', password_hash, role: 'STARSSA', full_name: 'Starssa Xodim' }
  });

  await prisma.user.upsert({
    where: { username: 'ustoz' },
    update: {},
    create: { username: 'ustoz', password_hash, role: 'USTOZ', full_name: 'Bosh Ustoz' }
  });

  console.log('Seed yakunlandi.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim());
  console.log('Created:', filepath);
}
