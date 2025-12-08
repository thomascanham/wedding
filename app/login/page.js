import { Paper, Text, PasswordInput, Button, Stack, Alert, Container } from '@mantine/core';
import { Login } from '@/actions/authActions';

export const metadata = {
  title: 'Please log in',
  description: 'Admin log in page',
}

export default async function LoginPage({ searchParams }) {
  const parameters = await searchParams;
  const returnTo = (parameters && parameters.returnTo) || '/';
  const error = parameters?.error;


  return (
    <Container size="xs">
      <Stack align="center" justify="center" style={{ minHeight: '100vh' }}>
        <Paper withBorder shadow="md" p="xl" radius="sm" style={{ width: '100%' }}>
          <Stack>
            {/* <Title order={2} ta="center">Project Sentinel</Title> */}
            <Text c={"var(--custom-theme-text"} ta="center" size="sm" mb="xl">
              Please enter your password to log in
            </Text>

            {error ? (
              <Alert color="red" variant="light">
                Incorrect password. Please try again.
              </Alert>
            ) : null}

            <form action={Login} style={{ display: 'grid', gap: '1.75rem' }}>
              <input type="hidden" name="returnTo" value={returnTo} />
              <PasswordInput
                name="passcode"
                label="Password"
                placeholder="••••••••"
                required
                size="md"
              />
              <Button type="submit" fullWidth size="md" variant='outline' color='var(--custom-theme-heading)'>
                Sign In
              </Button>
            </form>

            <Text c="dimmed" size="xs" ta="center">
              You will have to log back in 30 days from now
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}