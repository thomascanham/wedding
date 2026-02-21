'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SimpleGrid,
  Button,
  Group,
  Drawer,
  TextInput,
  Textarea,
  NumberInput,
  Stack,
  Alert,
  Text,
  MultiSelect,
  Divider,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import { IconPlus, IconLayoutGrid, IconList } from '@tabler/icons-react';
import { createRoom } from '@/actions/roomActions';
import RoomCard from './RoomCard';
import RoomList from './RoomList';

const VIEW_STORAGE_KEY = 'room-view-type';

export default function RoomManager({ roomsData, guestsData }) {
  const router = useRouter();
  const [viewType, setViewType] = useLocalStorage({
    key: VIEW_STORAGE_KEY,
    defaultValue: 'grid',
  });
  const [opened, { open, close }] = useDisclosure(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomBlock, setRoomBlock] = useState('');
  const [roomCapacity, setRoomCapacity] = useState(1);
  const [selectedGuests, setSelectedGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { data: roomsList = [], error: roomsError } = roomsData || {};
  const { data: guestsRaw = [] } = guestsData || {};

  const guests = Array.isArray(guestsRaw) ? guestsRaw : [];
  const guestOptions = guests
    .filter((guest) => guest.id && guest.name)
    .map((guest) => ({
      value: guest.id,
      label: guest.name,
    }));

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      setError('Please enter a room name');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await createRoom(
      roomName.trim(),
      roomDescription.trim(),
      roomBlock.trim(),
      roomCapacity,
      selectedGuests
    );

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    setRoomName('');
    setRoomDescription('');
    setRoomBlock('');
    setRoomCapacity(1);
    setSelectedGuests([]);
    setLoading(false);
    close();
    router.refresh();
  };

  const handleClose = () => {
    setRoomName('');
    setRoomDescription('');
    setRoomBlock('');
    setRoomCapacity(1);
    setSelectedGuests([]);
    setError(null);
    close();
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
      fontSize: 'var(--mantine-font-size-sm)',
      fontFamily: 'var(--mantine-font-family-headings)',
    },
  };

  if (roomsError) {
    return (
      <Alert title="Error Fetching Rooms" color="red" variant="filled">
        {roomsError.message}
      </Alert>
    );
  }

  return (
    <>
      <Drawer
        opened={opened}
        onClose={handleClose}
        title={<Text fw={700} size="xl" c="var(--custom-theme-heading)" ff="heading">Create New Room</Text>}
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
        <Stack gap="md" pt="md">
          <TextInput
            label="Room Name"
            placeholder="e.g., Room 1, Bridal Suite"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            styles={labelStyles}
          />

          <Textarea
            label="Description"
            placeholder="e.g., Ground floor, en-suite bathroom"
            value={roomDescription}
            onChange={(e) => setRoomDescription(e.target.value)}
            styles={labelStyles}
          />

          <TextInput
            label="Block"
            placeholder="e.g., Block A, Main Building"
            value={roomBlock}
            onChange={(e) => setRoomBlock(e.target.value)}
            styles={labelStyles}
          />

          <NumberInput
            label="Capacity"
            placeholder="Number of guests"
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
            <Group gap="xs">
              <Text size="sm" c="var(--custom-theme-text)" ff="text">
                Selected: {selectedGuests.length} guest{selectedGuests.length !== 1 ? 's' : ''}
              </Text>
            </Group>
          )}

          {error && (
            <Text size="sm" c="red" ff="text">{error}</Text>
          )}

          <Button
            color="var(--custom-theme-heading)"
            onClick={handleCreateRoom}
            loading={loading}
            fullWidth
            mt="md"
          >
            Create Room
          </Button>
        </Stack>
      </Drawer>

      <Group justify="space-between" mb="lg">
        <Group gap="xs">
          <Tooltip label="Grid view">
            <ActionIcon
              variant={viewType === 'grid' ? 'filled' : 'outline'}
              color="var(--custom-theme-heading)"
              size="lg"
              onClick={() => setViewType('grid')}
              aria-label="Grid view"
            >
              <IconLayoutGrid size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="List view">
            <ActionIcon
              variant={viewType === 'list' ? 'filled' : 'outline'}
              color="var(--custom-theme-heading)"
              size="lg"
              onClick={() => setViewType('list')}
              aria-label="List view"
            >
              <IconList size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Button
          leftSection={<IconPlus size={18} />}
          color="var(--custom-theme-heading)"
          onClick={open}
        >
          Create Room
        </Button>
      </Group>

      {roomsList.length === 0 ? (
        <Alert color="gray" variant="light">
          No rooms yet. Create your first room to get started.
        </Alert>
      ) : viewType === 'grid' ? (
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 3 }}
          spacing={{ base: 10, sm: 'xl' }}
          verticalSpacing={{ base: 'md', sm: 'xl' }}
        >
          {roomsList.map((room) => (
            <RoomCard key={room.id} room={room} allGuests={guests} />
          ))}
        </SimpleGrid>
      ) : (
        <RoomList data={roomsData} allGuests={guests} />
      )}
    </>
  );
}
