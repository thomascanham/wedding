'use server'
import { cookies } from "next/headers";
import { redirect } from 'next/navigation';
import { getPocketbase } from "@/database";

export async function Login(formData) {
  const database = await getPocketbase();
  let user = {};
  const cookieStore = await cookies();
  const username = String(formData.get('username') || '');
  const submitted = String(formData.get('passcode') || '');
  const to = String(formData.get('returnTo') || '/');

  // try to fetch the requested user and check if its valid
  try {
    let record = await database.collection('users').getFullList({
      filter: `email = "${username}"`,
    });
    if (record) {
      user = record[0];
    } else {
      user = null;
    }
  } catch (error) {
    console.log(error.message)
  }

  // if username doesnt exist, give error
  if (user === null || user === undefined) {
    redirect(`/login?error=1&returnTo=${encodeURIComponent(to)}`);
  }

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
  redirect('/admin' || returnTo);
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