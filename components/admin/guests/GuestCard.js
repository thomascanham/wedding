'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Button, Paper, Text, Group, ThemeIcon, Tooltip, Drawer, Stack, Badge, Divider, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPhoto, IconMessageReply, IconPhone, IconMail, IconToolsKitchen2, IconAlertCircle, IconTrash } from '@tabler/icons-react';
import getGuestInitials from '@/lib/getGuestInitials';
import { deleteGuest } from '@/actions/guestActions';

export function GuestCard({ guest }) {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const attendance = guest.attendanceType === 'reception' ? 'Reception' : 'Ceremony';
  const initials = getGuestInitials(guest.firstname, guest.surname);

  const handleDelete = async () => {
    setLoading(true);
    await deleteGuest(guest.id);
    setLoading(false);
    closeDeleteModal();
    close();
    router.refresh();
  };

  return (
    <>
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={<Text fw={700} size="lg" c="var(--custom-theme-heading)" ff="heading">Delete Guest</Text>}
        centered
        zIndex={300}
        styles={{
          content: { backgroundColor: 'var(--custom-theme-fill)' },
          header: { backgroundColor: 'var(--custom-theme-fill)' },
        }}
      >
        <Stack gap="md">
          <Text c="var(--custom-theme-text)" ff="text">
            Are you sure you want to delete {guest.name}? This action cannot be undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="outline" color="var(--custom-theme-heading)" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete} loading={loading}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Drawer
        opened={opened}
        onClose={close}
        title={<Text fw={700} size="xl" c="var(--custom-theme-heading)" ff="heading">{guest.name}</Text>}
        position="right"
        size="md"
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
        <GuestDrawerContent guest={guest} onDelete={openDeleteModal} />
      </Drawer>

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

        <StatusIcons guest={guest} />

        <Button fullWidth my="md" onClick={open} color='var(--custom-theme-heading)' variant='outline' ff="text">
          View Guest
        </Button>
      </Paper>
    </>
  );
}

function GuestDrawerContent({ guest, onDelete }) {
  const attendance = guest.attendanceType === 'reception' ? 'Reception' : 'Ceremony';

  const getRsvpBadge = () => {
    if (!guest.rsvpStatus) {
      return <Badge color="gray" size="lg" ff="text">Not Replied</Badge>;
    }
    if (guest.rsvpStatus === 'attending') {
      return <Badge color="green" size="lg" ff="text">Attending</Badge>;
    }
    return <Badge color="red" size="lg" ff="text">Not Attending</Badge>;
  };

  const dividerStyles = {
    label: {
      color: 'var(--custom-theme-heading)',
      fontWeight: 600,
      fontSize: 'var(--mantine-font-size-md)',
      fontFamily: 'var(--mantine-font-family-headings)',
    },
  };

  return (
    <Stack gap="lg" pt="md">
      <Group justify="space-between">
        <Text size="md" c="var(--custom-theme-text)" ff="text" fw={500}>Guest Type</Text>
        <Badge color="var(--custom-theme-heading)" variant="light" size="lg" ff="text">{attendance}</Badge>
      </Group>

      <Group justify="space-between">
        <Text size="md" c="var(--custom-theme-text)" ff="text" fw={500}>RSVP Status</Text>
        {getRsvpBadge()}
      </Group>

      <Group justify="space-between">
        <Text size="md" c="var(--custom-theme-text)" ff="text" fw={500}>Checked In</Text>
        <Badge color={guest.hasCheckedIn ? 'green' : 'gray'} size="lg" ff="text">
          {guest.hasCheckedIn ? 'Yes' : 'No'}
        </Badge>
      </Group>

      <Divider label="Contact" labelPosition="left" styles={dividerStyles} />

      {guest.phone && (
        <Group gap="sm">
          <IconPhone size={20} color="var(--custom-theme-text)" />
          <Text size="md" c="var(--custom-theme-text)" ff="text">{guest.phone}</Text>
        </Group>
      )}

      {guest.email && (
        <Group gap="sm">
          <IconMail size={20} color="var(--custom-theme-text)" />
          <Text size="md" c="var(--custom-theme-text)" ff="text">{guest.email}</Text>
        </Group>
      )}

      {!guest.phone && !guest.email && (
        <Text size="md" c="var(--custom-theme-text)" ff="text" fs="italic">No contact information</Text>
      )}

      <Divider label="Menu Choices" labelPosition="left" styles={dividerStyles} />

      <Group justify="space-between">
        <Text size="md" c="var(--custom-theme-text)" ff="text" fw={500}>Starter</Text>
        <Text size="md" c="var(--custom-theme-heading)" ff="text" fw={600} tt="capitalize">{guest.starter || '—'}</Text>
      </Group>

      <Group justify="space-between">
        <Text size="md" c="var(--custom-theme-text)" ff="text" fw={500}>Main</Text>
        <Text size="md" c="var(--custom-theme-heading)" ff="text" fw={600} tt="capitalize">{guest.main || '—'}</Text>
      </Group>

      <Group justify="space-between">
        <Text size="md" c="var(--custom-theme-text)" ff="text" fw={500}>Dessert</Text>
        <Text size="md" c="var(--custom-theme-heading)" ff="text" fw={600} tt="capitalize">{guest.dessert || '—'}</Text>
      </Group>

      {(guest.dietry || guest.allergies) && (
        <>
          <Divider label="Dietary Requirements" labelPosition="left" styles={dividerStyles} />

          {guest.dietry && (
            <Group gap="sm" align="flex-start">
              <IconToolsKitchen2 size={20} color="var(--custom-theme-text)" />
              <Text size="md" c="var(--custom-theme-text)" ff="text">{guest.dietry}</Text>
            </Group>
          )}

          {guest.allergies && (
            <Group gap="sm" align="flex-start">
              <IconAlertCircle size={20} color="red" />
              <Text size="md" c="var(--custom-theme-text)" ff="text">{guest.allergies}</Text>
            </Group>
          )}
        </>
      )}

      <Divider label="Actions" labelPosition="left" styles={dividerStyles} />

      <Button
        variant="outline"
        color="red"
        leftSection={<IconTrash size={18} />}
        onClick={onDelete}
        fullWidth
      >
        Delete Guest
      </Button>
    </Stack>
  );
}

function StatusIcons({ guest }) {
  const hasReplied = !!guest.rsvpStatus;
  const isAttending = guest.rsvpStatus === 'attending';
  const hasCheckedIn = guest.hasCheckedIn;

  const getRsvpColor = () => {
    if (!hasReplied) return 'gray';
    return isAttending ? 'green' : 'red';
  };

  const getRsvpLabel = () => {
    if (!hasReplied) return 'Not Replied';
    return isAttending ? 'Attending' : 'Not Attending';
  };

  return (
    <Group justify='center' pt="md">
      <Tooltip label={getRsvpLabel()}>
        <ThemeIcon variant="transparent" size="md" color={getRsvpColor()}>
          <IconMessageReply style={{ width: '70%', height: '70%' }} />
        </ThemeIcon>
      </Tooltip>

      <Tooltip label={hasCheckedIn ? 'Checked In' : 'Not Checked In'}>
        <ThemeIcon variant="transparent" size="md" color={hasCheckedIn ? 'green' : 'gray'}>
          <IconPhoto style={{ width: '70%', height: '70%' }} />
        </ThemeIcon>
      </Tooltip>
    </Group>
  )
}