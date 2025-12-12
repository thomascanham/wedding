'use client'
import Link from 'next/link';
import { Container, Group, Anchor } from '@mantine/core';
import { IconPlant, IconUserPentagon } from '@tabler/icons-react';
import classes from './navbar.module.css';
import LogoutButton from '../buttons/LogoutButton';

export default function Navbar() {
  return (
    <nav className={classes.navbar}>
      <Container>
        <Group justify='space-between' py="md">
          <IconUserPentagon size={24} />
          <div>
            <Anchor fz="lg" mx="lg" fw={700} ff="text" underline='false' component={Link} href="/admin">Dashboard</Anchor>
            <Anchor fz="lg" mx="lg" fw={700} ff="text" underline='false' component={Link} href="/admin/guests">Guests</Anchor>
            <Anchor fz="lg" mx="lg" fw={700} ff="text" underline='false' component={Link} href="/admin/invites">Invites</Anchor>
            <Anchor fz="lg" mx="lg" fw={700} ff="text" underline='false' component={Link} href="/admin/rooms">Rooms</Anchor>
          </div>
          <LogoutButton />
        </Group>
      </Container>

    </nav>
  )
}