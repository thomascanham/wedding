import { Paper, Text, PasswordInput, TextInput, Button, Stack, Alert, Container } from '@mantine/core';
import { Login } from '@/actions/authActions';

export const metadata = {
  title: 'Please log in',
  description: 'Admin log in page',
}

export default async function LoginPage({ searchParams }) {
  const parameters = await searchParams;
  const error = parameters?.error;

  return (
    <Container size="md">
      <Stack align="center" justify="center" style={{ minHeight: '100vh' }}>
        <Paper withBorder shadow="md" p="xl" radius="md" style={{ border: '2px solid var(--custom-theme-text)', width: '100%', maxWidth: 600 }}>
          <Stack>

            {error ? (
              <Alert color="red" title="Login Failed" variant="light" style={{ width: '100%' }}>
                Incorrect login details
              </Alert>
            ) : null}

            <form action={Login}>

              <TextInput
                name="username"
                type="email"
                placeholder="Email address"
                required
                size="lg"
                py="lg"
              />

              <PasswordInput
                name="passcode"
                placeholder="Password"
                required
                size="lg"
                py="lg"
              />
              <Button type="submit" fullWidth size="md" my="lg" variant='outline' color='var(--custom-theme-heading)'>
                Sign In
              </Button>
            </form>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}