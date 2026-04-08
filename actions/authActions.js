'use server'
import { cookies } from "next/headers";
import { redirect } from 'next/navigation';
import { db } from "@/database";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Dummy hash used when the user doesn't exist — prevents timing attacks
// that could reveal whether an email address is registered.
const DUMMY_HASH = '$2a$12$dummy.hash.to.prevent.timing.attacks.xxxxxxxxxxxxxxxxxx';

function sanitiseReturnTo(to) {
  // Only allow relative paths starting with / to prevent open redirects
  if (typeof to === 'string' && to.startsWith('/') && !to.startsWith('//')) {
    return to;
  }
  return '/admin';
}

export async function Login(formData) {
  const cookieStore = await cookies();
  const email = String(formData.get('username') || '').trim().toLowerCase();
  const password = String(formData.get('passcode') || '');

  try {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));

    // Always run bcrypt.compare to prevent timing attacks revealing valid emails
    const hashToCompare = user?.passwordHash ?? DUMMY_HASH;
    const valid = await bcrypt.compare(password, hashToCompare);

    if (!user || !valid) {
      redirect('/login?error=1');
    }

    cookieStore.set({
      name: process.env.SITE_UNLOCK_COOKIE,
      value: process.env.SITE_UNLOCK_TOKEN,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

  } catch (error) {
    if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    redirect('/login?error=1');
  }

  redirect('/admin');
}

export async function Logout() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: process.env.SITE_UNLOCK_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  redirect('/login');
}
