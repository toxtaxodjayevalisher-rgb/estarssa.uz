import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  if (pathname === '/logout' || pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  if (!token && pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  if (!token && pathname === '/') {
    return NextResponse.next();
  }

  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) throw new Error();
    
    const decodedJson = atob(payloadBase64);
    const decoded = JSON.parse(decodedJson);
    const role = decoded.role as string;

    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/' + role.toLowerCase(), request.url));
    }
    if (pathname.startsWith('/ustoz') && role !== 'USTOZ') {
      return NextResponse.redirect(new URL('/' + role.toLowerCase(), request.url));
    }
    if (pathname.startsWith('/starssa') && role !== 'STARSSA') {
      return NextResponse.redirect(new URL('/' + role.toLowerCase(), request.url));
    }

    if (pathname === '/') {
      return NextResponse.redirect(new URL('/' + role.toLowerCase(), request.url));
    }
  } catch (e) {
    return NextResponse.redirect(new URL('/logout', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};