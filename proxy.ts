import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
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