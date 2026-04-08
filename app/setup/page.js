export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { db } from '@/database';
import { adminUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { Paper, Text, TextInput, PasswordInput, Button, Stack, Alert, Container } from '@mantine/core';

export const metadata = {
  title: 'Setup',
};

export default async function SetupPage({ searchParams }) {
  // Route is disabled if no SETUP_TOKEN is set
  if (!process.env.SETUP_TOKEN) {
    redirect('/login');
  }

  // Route is disabled once any admin user exists
  const existing = await db.select().from(adminUsers);
  if (existing.length > 0) {
    redirect('/login');
  }

  const params = await searchParams;
  const error = params?.error;

  return (
    <Container size="md">
      <Stack align="center" justify="center" style={{ minHeight: '100vh' }}>
        <Paper withBorder shadow="md" p="xl" radius="md" style={{ border: '2px solid var(--custom-theme-text)', width: '100%', maxWidth: 600 }}>
          <Stack>
            <Text fw={700} size="xl" c="var(--custom-theme-heading)" ff="heading">Create Admin Account</Text>
            <Text size="sm" c="dimmed">This page is only available once. Once an admin account is created it will no longer be accessible.</Text>

            {error === '1' && (
              <Alert color="red" title="Error" variant="light">
                Invalid setup token.
              </Alert>
            )}
            {error === '2' && (
              <Alert color="red" title="Error" variant="light">
                Passwords do not match.
              </Alert>
            )}
            {error === '3' && (
              <Alert color="red" title="Error" variant="light">
                Please fill in all fields.
              </Alert>
            )}

            <form action={createAdminUser}>
              <Stack gap="md">
                <TextInput name="token" label="Setup Token" placeholder="Enter your SETUP_TOKEN" required />
                <TextInput name="email" label="Email" placeholder="you@example.com" type="email" required />
                <PasswordInput name="password" label="Password" placeholder="Choose a strong password" required />
                <PasswordInput name="confirm" label="Confirm Password" placeholder="Repeat your password" required />
                <Button type="submit" fullWidth size="md" variant="outline" color="var(--custom-theme-heading)">
                  Create Account
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}

async function createAdminUser(formData) {
  'use server';

  if (!process.env.SETUP_TOKEN) redirect('/login');

  // Block if a user already exists
  const existing = await db.select().from(adminUsers);
  if (existing.length > 0) redirect('/login');

  const token = String(formData.get('token') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const confirm = String(formData.get('confirm') || '');

  if (!token || !email || !password || !confirm) {
    redirect('/setup?error=3');
  }

  if (token !== process.env.SETUP_TOKEN) {
    redirect('/setup?error=1');
  }

  if (password !== confirm) {
    redirect('/setup?error=2');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.insert(adminUsers).values({ email, passwordHash });

  redirect('/login');
}
