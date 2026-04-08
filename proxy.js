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

  // Redirect to login — only pass local paths as returnTo to prevent open redirects
  const url = req.nextUrl.clone();
  url.pathname = UNLOCK_PATH;
  const safePath = pathname?.startsWith('/') && !pathname.startsWith('//') ? pathname : '/admin';
  url.searchParams.set('returnTo', safePath);

  return NextResponse.redirect(url);
}

// Which routes should use this proxy?
export const config = {
  matcher: ['/admin/:path*'],
};
