'use client'
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Table, Badge, Text, Group, Drawer, Stack, Divider, Button, MultiSelect, Modal, TextInput, Textarea, NumberInput } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { IconUsers, IconTrash } from '@tabler/icons-react';
import { updateRoom, deleteRoom, addGuestToRoom } from '@/actions/roomActions';

export default function RoomList({ data, allGuests }) {
  const router = useRouter();
  const { data: roomsList, error } = data;
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomBlock, setRoomBlock] = useState('');
  const [roomCapacity, setRoomCapacity] = useState(1);
  const [selectedGuests, setSelectedGuests] = useState([]);
  const [loading, setLoading] = useState(false);

  if (error) {
    return (
      <Alert title="Error Fetching Rooms" color="red" variant="filled">
        {error.message}
      </Alert>
    )
  }

  const sortedRooms = [...roomsList].sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const guestOptions = allGuests
    .filter((guest) => guest.id && guest.name)
    .map((guest) => ({
      value: guest.id,
      label: guest.name,
    }));

  const handleRowClick = (room) => {
    setSelectedRoom(room);
    setRoomName(room.name || '');
    setRoomDescription(room.description || '');
    setRoomBlock(room.block || '');
    setRoomCapacity(room.capacity || 1);
    setSelectedGuests(room.guest || []);
    open();
  };

  const handleSaveChanges = async () => {
    if (!selectedRoom) return;
    setLoading(true);
    await updateRoom(selectedRoom.id, {
      name: roomName,
      description: roomDescription,
      block: roomBlock,
      capacity: roomCapacity,
    });
    await addGuestToRoom(selectedRoom.id, selectedGuests);
    setLoading(false);
    close();
    router.refresh();
  };

  const handleDelete = async () => {
    if (!selectedRoom) return;
    setLoading(true);
    await deleteRoom(selectedRoom.id);
    setLoading(false);
    closeDeleteModal();
    close();
    router.refresh();
  };

  const rows = sortedRooms.map((room) => {
    const expandedGuests = room.expand?.guest || [];
    const guestCount = expandedGuests.length;

    return (
      <Table.Tr
        key={room.id}
        style={{ cursor: 'pointer' }}
        onClick={() => handleRowClick(room)}
      >
        <Table.Td>
          <Text fw={500} ff="text" c="var(--custom-theme-heading)">{room.name}</Text>
        </Table.Td>
        <Table.Td>
          {room.block && (
            <Badge color="var(--custom-theme-heading)" variant="light" size="sm" ff="text">
              {room.block}
            </Badge>
          )}
        </Table.Td>
        <Table.Td>
          <Text size="sm" c="var(--custom-theme-text)" ff="text">
            {room.capacity || 0}
          </Text>
        </Table.Td>
        <Table.Td>
          <Group gap="xs">
            <IconUsers size={16} color="var(--custom-theme-text)" />
            <Text size="sm" c="var(--custom-theme-text)" ff="text">
              {guestCount}
            </Text>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  const dividerStyles = {
    label: {
      color: 'var(--custom-theme-heading)',
      fontWeight: 600,
      fontSize: 'var(--mantine-font-size-md)',
      fontFamily: 'var(--mantine-font-family-headings)',
    },
  };

  const labelStyles = {
    label: {
      color: 'var(--custom-theme-text)',
      fontFamily: 'var(--mantine-font-family)',
    },
  };

  return (
    <>
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={<Text fw={700} size="lg" c="var(--custom-theme-heading)" ff="heading">Delete Room</Text>}
        centered
        zIndex={300}
        styles={{
          content: { backgroundColor: 'var(--custom-theme-fill)' },
          header: { backgroundColor: 'var(--custom-theme-fill)' },
        }}
      >
        <Stack gap="md">
          <Text c="var(--custom-theme-text)" ff="text">
            Are you sure you want to delete &quot;{selectedRoom?.name}&quot;? This action cannot be undone.
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
        title={selectedRoom && <Text fw={700} size="xl" c="var(--custom-theme-heading)" ff="heading">{selectedRoom.name}</Text>}
        position="right"
        size="md"
        styles={{
          content: { backgroundColor: 'var(--custom-theme-fill)' },
          header: {
            backgroundColor: 'var(--custom-theme-fill)',
            borderBottom: '2px solid var(--custom-theme-heading)',
            paddingBottom: 'var(--mantine-spacing-md)',
          },
          close: { color: 'var(--custom-theme-heading)' },
        }}
      >
        {selectedRoom && (
          <Stack gap="lg" pt="md">
            <TextInput
              label="Room Name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              styles={labelStyles}
            />

            <Textarea
              label="Description"
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              styles={labelStyles}
            />

            <TextInput
              label="Block"
              value={roomBlock}
              onChange={(e) => setRoomBlock(e.target.value)}
              styles={labelStyles}
            />

            <NumberInput
              label="Capacity"
              value={roomCapacity}
              onChange={setRoomCapacity}
              min={1}
              styles={labelStyles}
            />

            <Divider label="Guests" labelPosition="left" styles={dividerStyles} />

            <MultiSelect
              label="Assign Guests"
              placeholder="Choose guests for this room"
              data={guestOptions}
              value={selectedGuests}
              onChange={setSelectedGuests}
              searchable
              clearable
              comboboxProps={{ withinPortal: false }}
              styles={labelStyles}
            />

            {selectedGuests.length > 0 && (
              <Text size="sm" c="var(--custom-theme-text)" ff="text" fw={500}>
                Selected: {selectedGuests.length} guest{selectedGuests.length !== 1 ? 's' : ''}
              </Text>
            )}

            <Button
              color="var(--custom-theme-heading)"
              onClick={handleSaveChanges}
              loading={loading}
              fullWidth
            >
              Save Changes
            </Button>

            <Divider label="Actions" labelPosition="left" styles={dividerStyles} />

            <Button
              variant="outline"
              color="red"
              leftSection={<IconTrash size={18} />}
              onClick={openDeleteModal}
              fullWidth
            >
              Delete Room
            </Button>
          </Stack>
        )}
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
              <Table.Th>Block</Table.Th>
              <Table.Th>Capacity</Table.Th>
              <Table.Th>Guests</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
}
