import { NextResponse } from 'next/server';

const COOKIE_NAME = process.env.SITE_UNLOCK_COOKIE;
const UNLOCK_TOKEN = process.env.SITE_UNLOCK_TOKEN;
const UNLOCK_PATH = '/login';

export default function proxy(req) {
  const pathname = req.nextUrl.pathname;

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Check the cookie
  const cookieValue = req.cookies.get(COOKIE_NAME)?.value;

  if (cookieValue === UNLOCK_TOKEN) {
    return NextResponse.next();
  }

  // Redirect to login
  const url = req.nextUrl.clone();
  url.pathname = UNLOCK_PATH;
  url.searchParams.set('returnTo', pathname || '/admin');

  return NextResponse.redirect(url);
}

// Which routes should use this proxy?
export const config = {
  matcher: ['/admin/:path*'],
};
