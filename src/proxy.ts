import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/browse',
  '/interests',
  '/profile',
  '/edit-profile',
  '/verify-selfie',
  '/checkout',
  '/inbox',
];
// Only /login redirects an already-authenticated visitor away — /register is excluded
// because the signup wizard creates the account (and thus the session) after its first
// step, well before profile/location/photos are collected. Treating it like /login would
// bounce anyone who reloads mid-registration straight to /browse, abandoning their
// in-progress signup.
const AUTH_PAGES = ['/login'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isProtected && !hasSession) {
    const loginUrl = new URL('/login', request.nextUrl);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (AUTH_PAGES.includes(pathname) && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|uploads).*)'],
};
