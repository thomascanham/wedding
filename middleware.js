import { NextResponse } from 'next/server';

const COOKIE_NAME = process.env.SITE_UNLOCK_COOKIE;
const UNLOCK_TOKEN = process.env.SITE_UNLOCK_TOKEN;
const UNLOCK_PATH = '/login';

export function middleware(req) {
  const pathname = req.nextUrl.pathname;

  // Middleware should only run on /admin paths.
  // This is also enforced by the matcher, but this keeps it safe if matcher changes.
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Check cookie
  const cookieValue = COOKIE_NAME
    ? req.cookies.get(COOKIE_NAME)?.value
    : undefined;

  if (cookieValue === UNLOCK_TOKEN) {
    // Authenticated → allow access
    return NextResponse.next();
  }

  // Not authenticated → redirect to login
  const url = req.nextUrl.clone();
  url.pathname = UNLOCK_PATH;
  url.searchParams.set('returnTo', pathname || '/admin');

  return NextResponse.redirect(url);
}

// Only protect /admin routes
export const config = {
  matcher: ['/admin/:path*'],
};
