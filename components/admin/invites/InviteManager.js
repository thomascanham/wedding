'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SimpleGrid,
  Button,
  Group,
  Drawer,
  TextInput,
  Stack,
  Alert,
  Text,
  MultiSelect,
  Select,
  Divider,
  Paper,
  Box,
  ActionIcon,
  Badge,
  Tooltip,
} from '@mantine/core';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import { IconPlus, IconX, IconLayoutGrid, IconList, IconQrcode } from '@tabler/icons-react';
import { createInvite, generateAllQRCodes } from '@/actions/inviteActions';
import { createGuest } from '@/actions/guestActions';
import InviteCard from './InviteCard';
import InviteList from './InviteList';

const VIEW_STORAGE_KEY = 'invite-view-type';

export default function InviteManager({ invitesData, guestsData }) {
  const router = useRouter();
  const [viewType, setViewType] = useLocalStorage({
    key: VIEW_STORAGE_KEY,
    defaultValue: 'grid',
  });
  const [opened, { open, close }] = useDisclosure(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteAttendance, setInviteAttendance] = useState('ceremony');
  const [selectedGuests, setSelectedGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qrAllLoading, setQrAllLoading] = useState(false);

  // Inline guest creation state
  const [showNewGuestForm, setShowNewGuestForm] = useState(false);
  const [newGuestFirstname, setNewGuestFirstname] = useState('');
  const [newGuestSurname, setNewGuestSurname] = useState('');
  const [newGuestAttendance, setNewGuestAttendance] = useState('ceremony');
  const [newGuestLoading, setNewGuestLoading] = useState(false);
  const [newGuestError, setNewGuestError] = useState(null);

  // Track newly created guests (to show in the list before page refresh)
  const [newlyCreatedGuests, setNewlyCreatedGuests] = useState([]);

  const { data: invites = [], error: invitesError } = invitesData || {};
  const { data: guests = [] } = guestsData || {};

  // Combine existing guests with newly created ones for the dropdown
  const allAvailableGuests = [...(guests || []), ...newlyCreatedGuests];
  const guestOptions = allAvailableGuests
    .filter((guest) => guest.id && guest.name)
    .map((guest) => ({
      value: guest.id,
      label: guest.name,
    }));

  const handleCreateGuest = async () => {
    if (!newGuestFirstname.trim() || !newGuestSurname.trim()) {
      setNewGuestError('Please enter both first name and surname');
      return;
    }

    setNewGuestLoading(true);
    setNewGuestError(null);

    const result = await createGuest(
      newGuestFirstname.trim(),
      newGuestSurname.trim(),
      newGuestAttendance
    );

    if (result.error) {
      setNewGuestError(result.error.message);
      setNewGuestLoading(false);
      return;
    }

    // Add the new guest to our local list and select them
    setNewlyCreatedGuests([...newlyCreatedGuests, result.data]);
    setSelectedGuests([...selectedGuests, result.data.id]);

    // Reset the form
    setNewGuestFirstname('');
    setNewGuestSurname('');
    setNewGuestAttendance('ceremony');
    setNewGuestLoading(false);
    setShowNewGuestForm(false);
  };

  const handleCreateInvite = async () => {
    if (!inviteName.trim()) {
      setError('Please enter an invite name');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await createInvite(inviteName.trim(), selectedGuests, inviteAttendance);

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    // Reset all state
    setInviteName('');
    setInviteAttendance('ceremony');
    setSelectedGuests([]);
    setNewlyCreatedGuests([]);
    setLoading(false);
    close();
    router.refresh();
  };

  const handleClose = () => {
    setInviteName('');
    setInviteAttendance('ceremony');
    setSelectedGuests([]);
    setNewlyCreatedGuests([]);
    setShowNewGuestForm(false);
    setNewGuestFirstname('');
    setNewGuestSurname('');
    setNewGuestAttendance('ceremony');
    setNewGuestError(null);
    setError(null);
    close();
  };

  const handleGenerateAllQRCodes = async () => {
    setQrAllLoading(true);
    const baseUrl = window.location.origin;
    await generateAllQRCodes(baseUrl);
    setQrAllLoading(false);
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
      fontSize: 'var(--mantine-font-size-sm)',
      fontFamily: 'var(--mantine-font-family-headings)',
    },
  };

  if (invitesError) {
    return (
      <Alert title="Error Fetching Invites" color="red" variant="filled">
        {invitesError.message}
      </Alert>
    );
  }

  return (
    <>
      <Drawer
        opened={opened}
        onClose={handleClose}
        title={<Text fw={700} size="xl" c="var(--custom-theme-heading)" ff="heading">Create New Invite</Text>}
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
            label="Invite Name"
            placeholder="e.g., Smith Family"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            styles={labelStyles}
          />

          <Select
            label="Attendance Type"
            value={inviteAttendance}
            onChange={setInviteAttendance}
            data={[
              { label: 'Ceremony', value: 'ceremony' },
              { label: 'Reception', value: 'reception' },
            ]}
            comboboxProps={{ zIndex: 1000 }}
            styles={labelStyles}
          />

          <Divider label="Guests" labelPosition="left" styles={dividerStyles} />

          <MultiSelect
            label="Select Existing Guests"
            placeholder="Choose guests for this invite"
            data={guestOptions}
            value={selectedGuests}
            onChange={setSelectedGuests}
            searchable
            clearable
            comboboxProps={{ zIndex: 1000 }}
            styles={labelStyles}
          />

          {selectedGuests.length > 0 && (
            <Group gap="xs">
              <Text size="sm" c="var(--custom-theme-text)" ff="text">
                Selected: {selectedGuests.length} guest{selectedGuests.length !== 1 ? 's' : ''}
              </Text>
            </Group>
          )}

          {!showNewGuestForm ? (
            <Button
              variant="light"
              color="var(--custom-theme-heading)"
              leftSection={<IconPlus size={16} />}
              onClick={() => setShowNewGuestForm(true)}
              size="sm"
            >
              Create New Guest
            </Button>
          ) : (
            <Paper p="md" withBorder radius="md" bg="white">
              <Group justify="space-between" mb="sm">
                <Text size="sm" fw={600} c="var(--custom-theme-heading)" ff="heading">
                  New Guest
                </Text>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={() => {
                    setShowNewGuestForm(false);
                    setNewGuestFirstname('');
                    setNewGuestSurname('');
                    setNewGuestAttendance('ceremony');
                    setNewGuestError(null);
                  }}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
              <Stack gap="sm">
                <Group grow>
                  <TextInput
                    label="First Name"
                    placeholder="First name"
                    value={newGuestFirstname}
                    onChange={(e) => setNewGuestFirstname(e.target.value)}
                    size="sm"
                    styles={labelStyles}
                  />
                  <TextInput
                    label="Surname"
                    placeholder="Surname"
                    value={newGuestSurname}
                    onChange={(e) => setNewGuestSurname(e.target.value)}
                    size="sm"
                    styles={labelStyles}
                  />
                </Group>
                <Select
                  label="Attendance Type"
                  value={newGuestAttendance}
                  onChange={setNewGuestAttendance}
                  data={[
                    { label: 'Ceremony', value: 'ceremony' },
                    { label: 'Reception', value: 'reception' },
                  ]}
                  size="sm"
                  comboboxProps={{ zIndex: 1000 }}
                  styles={labelStyles}
                />
                {newGuestError && (
                  <Text size="sm" c="red" ff="text">{newGuestError}</Text>
                )}
                <Button
                  color="var(--custom-theme-heading)"
                  onClick={handleCreateGuest}
                  loading={newGuestLoading}
                  size="sm"
                  fullWidth
                >
                  Add Guest to Invite
                </Button>
              </Stack>
            </Paper>
          )}

          {newlyCreatedGuests.length > 0 && (
            <Box>
              <Text size="xs" c="dimmed" mb="xs">Newly created guests:</Text>
              <Group gap="xs">
                {newlyCreatedGuests.map((guest) => (
                  <Badge key={guest.id} color="green" variant="light" size="sm">
                    {guest.name}
                  </Badge>
                ))}
              </Group>
            </Box>
          )}

          {error && (
            <Text size="sm" c="red" ff="text">{error}</Text>
          )}

          <Button
            color="var(--custom-theme-heading)"
            onClick={handleCreateInvite}
            loading={loading}
            fullWidth
            mt="md"
          >
            Create Invite
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
        <Group gap="sm">
          <Button
            variant="outline"
            leftSection={<IconQrcode size={18} />}
            color="var(--custom-theme-heading)"
            onClick={handleGenerateAllQRCodes}
            loading={qrAllLoading}
          >
            Generate All QR Codes
          </Button>
          <Button
            leftSection={<IconPlus size={18} />}
            color="var(--custom-theme-heading)"
            onClick={open}
          >
            Create Invite
          </Button>
        </Group>
      </Group>

      {invites.length === 0 ? (
        <Alert color="gray" variant="light">
          No invites yet. Create your first invite to get started.
        </Alert>
      ) : viewType === 'grid' ? (
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 3 }}
          spacing={{ base: 10, sm: 'xl' }}
          verticalSpacing={{ base: 'md', sm: 'xl' }}
        >
          {invites.map((invite) => (
            <InviteCard key={invite.id} invite={invite} allGuests={allAvailableGuests} />
          ))}
        </SimpleGrid>
      ) : (
        <InviteList data={invitesData} allGuests={allAvailableGuests} />
      )}
    </>
  );
}
