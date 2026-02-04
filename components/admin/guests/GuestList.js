'use client'
import { Alert, Table, Badge, Text, Avatar, Group, Drawer, Stack, Divider } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { IconPhone, IconMail, IconToolsKitchen2, IconAlertCircle } from '@tabler/icons-react';
import getGuestInitials from '@/lib/getGuestInitials';

export default function GuestList({ data }) {
  const { data: guests, error } = data;
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);

  if (error) {
    return (
      <Alert title="Error Fetching Guests" color="red" variant="filled">
        {error.message}
      </Alert>
    )
  }

  const sortedGuests = [...guests].sort((a, b) => {
    const nameA = (a.surname || a.name || '').toLowerCase();
    const nameB = (b.surname || b.name || '').toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    const firstA = (a.firstname || '').toLowerCase();
    const firstB = (b.firstname || '').toLowerCase();
    return firstA.localeCompare(firstB);
  });

  const handleRowClick = (guest) => {
    setSelectedGuest(guest);
    open();
  };

  const getRsvpBadge = (guest) => {
    if (!guest.rsvpStatus) {
      return <Badge color="gray" size="sm" ff="text">Not Replied</Badge>;
    }
    if (guest.rsvpStatus === 'attending') {
      return <Badge color="green" size="sm" ff="text">Attending</Badge>;
    }
    return <Badge color="red" size="sm" ff="text">Not Attending</Badge>;
  };

  const rows = sortedGuests.map((guest) => {
    const initials = getGuestInitials(guest.firstname, guest.surname);
    const attendance = guest.attendanceType === 'reception' ? 'Reception' : 'Ceremony';

    return (
      <Table.Tr
        key={guest.id}
        style={{ cursor: 'pointer' }}
        onClick={() => handleRowClick(guest)}
      >
        <Table.Td>
          <Group gap="sm">
            <Avatar
              size={36}
              radius={36}
              color='var(--custom-theme-text)'
              variant='outline'
            >
              {initials}
            </Avatar>
            <Text fw={500} ff="text" c="var(--custom-theme-heading)">{guest.name}</Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Badge color="var(--custom-theme-heading)" variant="light" size="sm" ff="text">
            {attendance}
          </Badge>
        </Table.Td>
        <Table.Td>{getRsvpBadge(guest)}</Table.Td>
        <Table.Td>
          <Badge color={guest.hasCheckedIn ? 'green' : 'gray'} size="sm" ff="text">
            {guest.hasCheckedIn ? 'Yes' : 'No'}
          </Badge>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <>
      <Drawer
        opened={opened}
        onClose={close}
        title={selectedGuest && <Text fw={700} size="xl" c="var(--custom-theme-heading)" ff="heading">{selectedGuest.name}</Text>}
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
        {selectedGuest && <GuestDrawerContent guest={selectedGuest} />}
      </Drawer>

      <Table.ScrollContainer minWidth={500} py="xl">
        <Table
          highlightOnHover
          verticalSpacing="md"
          styles={{
            table: {
              backgroundColor: 'white',
              borderRadius: 'var(--mantine-radius-md)',
            },
            thead: {
              backgroundColor: 'var(--custom-theme-fill)',
            },
            th: {
              color: 'var(--custom-theme-heading)',
              fontFamily: 'var(--mantine-font-family-headings)',
              fontWeight: 600,
            },
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Guest Type</Table.Th>
              <Table.Th>RSVP</Table.Th>
              <Table.Th>Checked In</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
}

function GuestDrawerContent({ guest }) {
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
    </Stack>
  );
}
