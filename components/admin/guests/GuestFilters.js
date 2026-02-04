'use client'
import { useState } from 'react';
import { SegmentedControl, Box, Group, Text, ActionIcon, Tooltip } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconLayoutGrid, IconList } from '@tabler/icons-react';
import GuestGrid from '@/components/admin/layout/GuestGrid';
import GuestList from '@/components/admin/guests/GuestList';

const VIEW_STORAGE_KEY = 'guest-view-type';

export default function GuestFilters({ data }) {
  const [viewType, setViewType] = useLocalStorage({
    key: VIEW_STORAGE_KEY,
    defaultValue: 'grid',
  });
  const [attendanceFilter, setAttendanceFilter] = useState('all');
  const [rsvpFilter, setRsvpFilter] = useState('all');
  const [rsvpResponseFilter, setRsvpResponseFilter] = useState('all');

  const filteredData = {
    ...data,
    data: data.data?.filter((guest) => {
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
    }) || []
  };

  const segmentedStyles = {
    root: {
      backgroundColor: 'var(--custom-theme-fill)',
    },
  };

  return (
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

      {viewType === 'grid' ? (
        <GuestGrid data={filteredData} />
      ) : (
        <GuestList data={filteredData} />
      )}
    </Box>
  );
}
