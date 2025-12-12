'use client'
import { Avatar, Button, Paper, Text, Group, ThemeIcon, Tooltip } from '@mantine/core';
import Link from 'next/link';
import { IconPhoto, IconSend2, IconMessageReply } from '@tabler/icons-react';
import getGuestInitials from '@/lib/getGuestInitials';

export function GuestCard({ guest }) {
  const attendance = guest.attendanceType === 'reception' ? 'Reception' : 'Ceremony';
  const initials = getGuestInitials(guest.firstname, guest.surname)

  return (
    <Paper shadow="md" radius="md" withBorder p="lg" bg="white" style={{ border: '2px solid var(--custom-theme-heading)' }}>
      <Avatar
        size={60}
        radius={60}
        mx="auto"
        color='var(--custom-theme-text)'
        variant='outline'
      >{initials}</Avatar>
      <Text ta="center" fz="lg" fw={500} mt="md" ff={'text'} c="var(--custom-theme-heading)">
        {guest.name}
      </Text>
      <Text ta="center" c="dimmed" fz="sm" ff={'text'}>
        {attendance}
      </Text>

      <StatusIcons />

      <Button fullWidth my="md" component={Link} href={`/guest/${guest.id}`} color='var(--custom-theme-heading)' variant='outline' ff="text">
        View Guest
      </Button>
    </Paper >
  );
}

function StatusIcons({ info }) {
  return (
    <Group justify='center' pt="md">
      <Tooltip label="Invite Sent">
        <ThemeIcon variant="transparent" size="md" color="gray">
          <IconSend2 style={{ width: '70%', height: '70%' }} />
        </ThemeIcon>
      </Tooltip>

      <Tooltip label="RSVP Status">
        <ThemeIcon variant="transparent" size="md" color="green">
          <IconMessageReply style={{ width: '70%', height: '70%' }} />
        </ThemeIcon>
      </Tooltip>

      <Tooltip label="Attending">
        <ThemeIcon variant="transparent" size="md" color="red">
          <IconPhoto style={{ width: '70%', height: '70%' }} />
        </ThemeIcon>
      </Tooltip>
    </Group>
  )
}