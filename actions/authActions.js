'use server'
import { cookies } from "next/headers";
import { redirect } from 'next/navigation';

export async function Login(formData) {
  const cookieStore = await cookies();
  const submitted = String(formData.get('passcode') || '');
  const to = String(formData.get('returnTo') || '/');

  //wrong passcode, redirect back with error flag
  if (submitted !== process.env.SITE_PASSCODE) {
    redirect(`/login?error=1&returnTo=${encodeURIComponent(to)}`);
  }

  //Correct password, set 30 day hhtponly cookie
  cookieStore.set({
    name: process.env.SITE_UNLOCK_COOKIE,
    value: process.env.SITE_UNLOCK_TOKEN,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Go to the originall requested page or the admin
  redirect('/admin');
}

export async function Logout(redirectTo = '/login') {
  const cookieStore = await cookies();

  cookieStore.set({
    name: process.env.SITE_UNLOCK_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Expire immediately
  });

  redirect('/login');
}