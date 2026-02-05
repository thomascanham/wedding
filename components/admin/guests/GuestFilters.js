'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SegmentedControl, Box, Group, Text, ActionIcon, Tooltip, Button, Modal, TextInput, Stack, Select } from '@mantine/core';
import { useLocalStorage, useDisclosure } from '@mantine/hooks';
import { IconLayoutGrid, IconList, IconPlus } from '@tabler/icons-react';
import GuestGrid from '@/components/admin/layout/GuestGrid';
import GuestList from '@/components/admin/guests/GuestList';
import { createGuest } from '@/actions/guestActions';

const VIEW_STORAGE_KEY = 'guest-view-type';

export default function GuestFilters({ data }) {
  const router = useRouter();
  const [viewType, setViewType] = useLocalStorage({
    key: VIEW_STORAGE_KEY,
    defaultValue: 'grid',
  });
  const [attendanceFilter, setAttendanceFilter] = useState('all');
  const [rsvpFilter, setRsvpFilter] = useState('all');
  const [rsvpResponseFilter, setRsvpResponseFilter] = useState('all');

  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [firstname, setFirstname] = useState('');
  const [surname, setSurname] = useState('');
  const [attendanceType, setAttendanceType] = useState('ceremony');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateGuest = async () => {
    if (!firstname.trim() || !surname.trim()) {
      setError('Please enter both first name and surname');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await createGuest(firstname.trim(), surname.trim(), attendanceType);

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    setFirstname('');
    setSurname('');
    setAttendanceType('ceremony');
    setLoading(false);
    closeModal();
    router.refresh();
  };

  const handleCloseModal = () => {
    setFirstname('');
    setSurname('');
    setAttendanceType('ceremony');
    setError(null);
    closeModal();
  };

  const guestArray = Array.isArray(data?.data) ? data.data : [];

  const filteredData = {
    ...data,
    data: guestArray.filter((guest) => {
      // Attendance type filter (ceremony/reception)
      if (attendanceFilter !== 'all' && guest.attendanceType !== attendanceFilter) {
        return false;
      }

      // RSVP filter (replied/not replied)
      if (rsvpFilter === 'replied' && !guest.rsvpStatus) {
        return false;
      }
      if (rsvpFilter === 'not-replied' && guest.rsvpStatus) {
        return false;
      }

      // RSVP response sub-filter (attending/not attending)
      if (rsvpFilter === 'replied' && rsvpResponseFilter !== 'all') {
        if (guest.rsvpStatus !== rsvpResponseFilter) {
          return false;
        }
      }

      return true;
    })
  };

  const segmentedStyles = {
    root: {
      backgroundColor: 'var(--custom-theme-fill)',
    },
  };

  return (
    <>
      <Modal
        opened={modalOpened}
        onClose={handleCloseModal}
        title={<Text fw={700} size="lg" c="var(--custom-theme-heading)" ff="heading">Add New Guest</Text>}
        centered
        styles={{
          content: { backgroundColor: 'var(--custom-theme-fill)' },
          header: { backgroundColor: 'var(--custom-theme-fill)' },
        }}
      >
        <Stack gap="md">
          <TextInput
            label="First Name"
            placeholder="Enter first name"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            styles={{
              label: { color: 'var(--custom-theme-text)', fontFamily: 'var(--mantine-font-family)' },
            }}
          />
          <TextInput
            label="Surname"
            placeholder="Enter surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            styles={{
              label: { color: 'var(--custom-theme-text)', fontFamily: 'var(--mantine-font-family)' },
            }}
          />
          <Select
            label="Attendance Type"
            value={attendanceType}
            onChange={setAttendanceType}
            data={[
              { label: 'Ceremony', value: 'ceremony' },
              { label: 'Reception', value: 'reception' },
            ]}
            styles={{
              label: { color: 'var(--custom-theme-text)', fontFamily: 'var(--mantine-font-family)' },
            }}
          />
          {error && (
            <Text size="sm" c="red" ff="text">{error}</Text>
          )}
          <Group justify="flex-end" gap="sm">
            <Button variant="outline" color="var(--custom-theme-heading)" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button color="var(--custom-theme-heading)" onClick={handleCreateGuest} loading={loading}>
              Add Guest
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Box>
        <Group gap="xl" wrap="wrap" justify="space-between" align="flex-end">
          <Group gap="xl" wrap="wrap">
            <Box>
              <Text size="sm" fw={500} mb={4} c="var(--custom-theme-text)">Guest Type</Text>
              <SegmentedControl
                value={attendanceFilter}
                onChange={setAttendanceFilter}
                data={[
                  { label: 'All', value: 'all' },
                  { label: 'Ceremony', value: 'ceremony' },
                  { label: 'Reception', value: 'reception' },
                ]}
                color="var(--custom-theme-heading)"
                styles={segmentedStyles}
              />
            </Box>

            <Box>
              <Text size="sm" fw={500} mb={4} c="var(--custom-theme-text)">RSVP Status</Text>
              <SegmentedControl
                value={rsvpFilter}
                onChange={(value) => {
                  setRsvpFilter(value);
                  if (value !== 'replied') {
                    setRsvpResponseFilter('all');
                  }
                }}
                data={[
                  { label: 'All', value: 'all' },
                  { label: 'Replied', value: 'replied' },
                  { label: 'Not Replied', value: 'not-replied' },
                ]}
                color="var(--custom-theme-heading)"
                styles={segmentedStyles}
              />
            </Box>

            {rsvpFilter === 'replied' && (
              <Box>
                <Text size="sm" fw={500} mb={4} c="var(--custom-theme-text)">Response</Text>
                <SegmentedControl
                  value={rsvpResponseFilter}
                  onChange={setRsvpResponseFilter}
                  data={[
                    { label: 'All', value: 'all' },
                    { label: 'Attending', value: 'attending' },
                    { label: 'Not Attending', value: 'not attending' },
                  ]}
                  color="var(--custom-theme-heading)"
                  styles={segmentedStyles}
                />
              </Box>
            )}
          </Group>

          <Group gap="md">
            <Button
              leftSection={<IconPlus size={18} />}
              color="var(--custom-theme-heading)"
              onClick={openModal}
            >
              Add Guest
            </Button>
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
          </Group>
        </Group>

        {viewType === 'grid' ? (
          <GuestGrid data={filteredData} />
        ) : (
          <GuestList data={filteredData} />
        )}
      </Box>
    </>
  );
}
