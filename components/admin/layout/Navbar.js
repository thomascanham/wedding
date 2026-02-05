'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container, Group, Anchor, Burger, Drawer, Stack, Divider, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHearts } from '@tabler/icons-react';
import classes from './navbar.module.css';
import LogoutButton from '../buttons/LogoutButton';

const navLinks = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Guests', href: '/admin/guests' },
  { label: 'Invites', href: '/admin/invites' },
  { label: 'Rooms', href: '/admin/rooms' },
  { label: 'Comms', href: '/admin/comms' },
];

export default function Navbar() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className={classes.navbar}>
      <Container>
        <Group justify='space-between' py="md">
          <Group align='center'>
            <IconHearts size={28} className={classes.icon} />

            {/* Desktop Navigation */}
            <Group className={classes.desktopNav}>
              {navLinks.map((link) => (
                <Anchor
                  key={link.href}
                  fz="lg"
                  mx="lg"
                  fw={700}
                  underline='never'
                  component={Link}
                  href={link.href}
                  className={isActive(link.href) ? classes.activeLink : ''}
                >
                  {link.label}
                </Anchor>
              ))}
            </Group>
          </Group>

          {/* Desktop Logout */}
          <Box className={classes.desktopNav}>
            <LogoutButton />
          </Box>

          {/* Mobile Burger */}
          <Burger
            opened={opened}
            onClick={toggle}
            className={classes.burger}
            color="var(--custom-theme-text)"
            aria-label="Toggle navigation"
          />
        </Group>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        title={
          <Group align="center" gap="xs">
            <IconHearts size={24} color="var(--custom-theme-heading)" />
            <span style={{ fontWeight: 700, color: 'var(--custom-theme-heading)' }}>Menu</span>
          </Group>
        }
        padding="lg"
        size="xs"
        position="right"
        styles={{
          content: {
            backgroundColor: 'var(--custom-theme-fill)',
          },
          header: {
            backgroundColor: 'var(--custom-theme-fill)',
            borderBottom: '2px solid var(--custom-theme-heading)',
            paddingBottom: 'var(--mantine-spacing-md)',
          },
          close: {
            color: 'var(--custom-theme-heading)',
          },
        }}
      >
        <Stack gap="md" pt="md">
          {navLinks.map((link) => (
            <Anchor
              key={link.href}
              fz="lg"
              fw={600}
              underline='never'
              component={Link}
              href={link.href}
              onClick={close}
              c={isActive(link.href) ? 'var(--custom-theme-heading)' : 'var(--custom-theme-text)'}
              className={isActive(link.href) ? classes.activeMobileLink : ''}
            >
              {link.label}
            </Anchor>
          ))}
          <Divider my="sm" />
          <LogoutButton />
        </Stack>
      </Drawer>
    </nav>
  )
}
