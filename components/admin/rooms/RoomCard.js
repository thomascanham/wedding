'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Paper,
  Text,
  Group,
  Badge,
  Button,
  Stack,
  Avatar,
  Drawer,
  MultiSelect,
  Divider,
  Modal,
  TextInput,
  Textarea,
  NumberInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconTrash, IconUsers, IconBed } from '@tabler/icons-react';
import { updateRoom, deleteRoom, addGuestToRoom } from '@/actions/roomActions';
import getGuestInitials from '@/lib/getGuestInitials';

export default function RoomCard({ room, allGuests }) {
  const router = useRouter();
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [roomName, setRoomName] = useState(room.name || '');
  const [roomDescription, setRoomDescription] = useState(room.description || '');
  const [roomBlock, setRoomBlock] = useState(room.block || '');
  const [roomCapacity, setRoomCapacity] = useState(room.capacity || 1);
  const [selectedGuests, setSelectedGuests] = useState(room.guest || []);
  const [loading, setLoading] = useState(false);

  const expandedGuests = room.expand?.guest || [];
  const guestCount = expandedGuests.length;

  const guestOptions = allGuests
    .filter((guest) => guest.id && guest.name)
    .map((guest) => ({
      value: guest.id,
      label: guest.name,
    }));

  const handleDelete = async () => {
    setLoading(true);
    await deleteRoom(room.id);
    setLoading(false);
    closeDeleteModal();
    router.refresh();
  };

  const handleOpenDrawer = () => {
    setRoomName(room.name || '');
    setRoomDescription(room.description || '');
    setRoomBlock(room.block || '');
    setRoomCapacity(room.capacity || 1);
    setSelectedGuests(room.guest || []);
    openDrawer();
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    await updateRoom(room.id, {
      name: roomName,
      description: roomDescription,
      block: roomBlock,
      capacity: roomCapacity,
    });
    await addGuestToRoom(room.id, selectedGuests);
    setLoading(false);
    closeDrawer();
    router.refresh();
  };

  const labelStyles = {
    label: {
      color: 'var(--custom-theme-text)',
      fontFamily: 'var(--mantine-font-family)',
    },
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
            Are you sure you want to delete the room &quot;{room.name}&quot;? This action cannot be undone.
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
        opened={drawerOpened}
        onClose={closeDrawer}
        title={<Text fw={700} size="xl" c="var(--custom-theme-heading)" ff="heading">{room.name}</Text>}
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
      </Drawer>

      <Paper
        shadow="md"
        radius="md"
        withBorder
        p="lg"
        bg="white"
        style={{ border: '2px solid var(--custom-theme-heading)' }}
      >
        <Group justify="space-between" mb="md">
          <Text fz="lg" fw={500} ff="heading" c="var(--custom-theme-heading)">
            {room.name}
          </Text>
          {room.block && (
            <Badge color="var(--custom-theme-heading)" variant="light" size="sm" ff="text">
              {room.block}
            </Badge>
          )}
        </Group>

        <Group gap="md" mb="md">
          <Group gap="xs">
            <IconBed size={18} color="var(--custom-theme-text)" />
            <Text size="sm" c="var(--custom-theme-text)" ff="text">
              Sleeps {room.capacity || 0}
            </Text>
          </Group>
          <Group gap="xs">
            <IconUsers size={18} color="var(--custom-theme-text)" />
            <Text size="sm" c="var(--custom-theme-text)" ff="text">
              {guestCount} guest{guestCount !== 1 ? 's' : ''}
            </Text>
          </Group>
        </Group>

        {expandedGuests.length > 0 && (
          <Stack gap="xs" mb="md">
            {expandedGuests.slice(0, 3).map((guest) => (
              <Group key={guest.id} gap="xs">
                <Avatar
                  size={24}
                  radius={24}
                  color="var(--custom-theme-text)"
                  variant="outline"
                >
                  {getGuestInitials(guest.firstname, guest.surname)}
                </Avatar>
                <Text size="sm" c="var(--custom-theme-text)" ff="text">
                  {guest.name}
                </Text>
              </Group>
            ))}
            {expandedGuests.length > 3 && (
              <Text size="xs" c="dimmed" ff="text" fs="italic">
                +{expandedGuests.length - 3} more
              </Text>
            )}
          </Stack>
        )}

        <Button
          fullWidth
          onClick={handleOpenDrawer}
          color="var(--custom-theme-heading)"
          variant="outline"
          ff="text"
        >
          Manage Room
        </Button>
      </Paper>
    </>
  );
}
