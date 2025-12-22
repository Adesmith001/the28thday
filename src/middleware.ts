import { NextResponse } from 'next/server';

export function middleware() {
  // Firebase Auth in this app is handled client-side (signInWithPopup), so there is
  // no server-readable session cookie to enforce route protection in middleware.
  // Keep middleware as a no-op to avoid redirect loops (e.g. /onboarding -> /login).
  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
