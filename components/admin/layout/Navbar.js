'use client'
import Link from 'next/link';
import { Container, Group, Anchor } from '@mantine/core';
import { IconHearts, IconConfettiFilled } from '@tabler/icons-react';
import classes from './navbar.module.css';
import LogoutButton from '../buttons/LogoutButton';

export default function Navbar() {
  return (
    <nav className={classes.navbar}>
      <Container>
        <Group justify='space-between' py="md">
          <Group align='center'>
            <IconHearts size={28} />
            <Anchor fz="lg" mx="lg" fw={700} underline='false' component={Link} href="/admin">Dashboard</Anchor>
            <Anchor fz="lg" mx="lg" fw={700} underline='false' component={Link} href="/admin/guests">Guests</Anchor>
            <Anchor fz="lg" mx="lg" fw={700} underline='false' component={Link} href="/admin/invites">Invites</Anchor>
            <Anchor fz="lg" mx="lg" fw={700} underline='false' component={Link} href="/admin/rooms">Rooms</Anchor>
          </Group>
          <LogoutButton />
        </Group>
      </Container>
    </nav>
  )
}