'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Group, Badge, Table, Text, Alert, Stack, Modal, Select, Button } from "@mantine/core";
import { IconAlertCircle, IconToolsKitchen2, IconArmchair } from "@tabler/icons-react";
import { updateGuestSeatNumber } from "@/actions/guestActions";

const TOTAL_SEATS = 60;

export default function SeatingTable({ guests }) {
  const router = useRouter();
  const [activeSeat, setActiveSeat] = useState(null);
  const [selectedGuestId, setSelectedGuestId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const seatMap = new Map();
  const unplaced = [];

  guests.forEach((guest) => {
    if (!guest.seatNumber) return;
    const trimmed = guest.seatNumber.trim();
    const num = Number(trimmed);
    const isValidSeat = Number.isInteger(num) && num >= 1 && num <= TOTAL_SEATS && String(num) === trimmed;
    if (isValidSeat) {
      seatMap.set(num, guest);
    } else {
      unplaced.push(guest);
    }
  });

  const assignedCount = seatMap.size;
  const seatedGuestIds = new Set(Array.from(seatMap.values()).map((g) => g.id));
  const unseatedCeremonyGuests = guests
    .filter((g) => g.attendanceType === 'ceremony' && !seatedGuestIds.has(g.id))
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const activeGuest = activeSeat ? seatMap.get(activeSeat) : null;

  const openSeat = (seatNum) => {
    setActiveSeat(seatNum);
    setSelectedGuestId(null);
    setError(null);
  };

  const closeModal = () => {
    setActiveSeat(null);
    setSelectedGuestId(null);
    setError(null);
  };

  const handleAssign = async () => {
    if (!selectedGuestId) return;
    setSaving(true);
    setError(null);
    const response = await updateGuestSeatNumber(selectedGuestId, String(activeSeat));
    setSaving(false);
    if (response.error) {
      setError(response.error.message);
      return;
    }
    closeModal();
    router.refresh();
  };

  const handleRemove = async () => {
    if (!activeGuest) return;
    setSaving(true);
    setError(null);
    const response = await updateGuestSeatNumber(activeGuest.id, '');
    setSaving(false);
    if (response.error) {
      setError(response.error.message);
      return;
    }
    closeModal();
    router.refresh();
  };

  const rows = Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1).map((seatNum) => {
    const guest = seatMap.get(seatNum);

    return (
      <Table.Tr key={seatNum} style={{ cursor: 'pointer' }} onClick={() => openSeat(seatNum)}>
        <Table.Td w={80}>
          <Text fw={700} ff="text" c="var(--custom-theme-heading)">{seatNum}</Text>
        </Table.Td>
        <Table.Td>
          {guest ? (
            <Text fw={500} ff="text" c="var(--custom-theme-text)">{guest.name}</Text>
          ) : (
            <Text fs="italic" c="dimmed" ff="text">Unassigned</Text>
          )}
        </Table.Td>
        <Table.Td>
          {guest && (guest.dietry || guest.allergies) ? (
            <Stack gap={2}>
              {guest.dietry && (
                <Group gap={6} wrap="nowrap">
                  <IconToolsKitchen2 size={13} color="var(--mantine-color-gray-5)" style={{ flexShrink: 0 }} />
                  <Text size="sm" ff="text" c="var(--custom-theme-text)">{guest.dietry}</Text>
                </Group>
              )}
              {guest.allergies && (
                <Group gap={6} wrap="nowrap">
                  <IconAlertCircle size={13} color="red" style={{ flexShrink: 0 }} />
                  <Text size="sm" ff="text" c="red">{guest.allergies}</Text>
                </Group>
              )}
            </Stack>
          ) : (
            guest && <Text size="sm" fs="italic" c="dimmed" ff="text">—</Text>
          )}
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <>
      <Modal
        opened={activeSeat !== null}
        onClose={closeModal}
        title={<Text fw={700} size="xl" c="var(--custom-theme-heading)" ff="heading">Seat {activeSeat}</Text>}
        centered
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
        <Stack gap="md" pt="md">
          {activeGuest ? (
            <>
              <Group gap="sm">
                <IconArmchair size={18} color="var(--custom-theme-heading)" />
                <Text ff="text" c="var(--custom-theme-text)">
                  Currently assigned to <Text span fw={700}>{activeGuest.name}</Text>
                </Text>
              </Group>
              <Button
                variant="outline"
                color="red"
                onClick={handleRemove}
                loading={saving}
                ff="text"
              >
                Remove from Seat
              </Button>
            </>
          ) : (
            <>
              <Select
                label="Assign a guest"
                placeholder={unseatedCeremonyGuests.length ? "Choose a guest" : "No unseated ceremony guests"}
                data={unseatedCeremonyGuests.map((g) => ({ value: g.id, label: g.name }))}
                value={selectedGuestId}
                onChange={setSelectedGuestId}
                searchable
                nothingFoundMessage="No guests found"
                disabled={unseatedCeremonyGuests.length === 0}
                styles={{ label: { color: 'var(--custom-theme-text)' } }}
              />
              <Button
                color="var(--custom-theme-heading)"
                onClick={handleAssign}
                loading={saving}
                disabled={!selectedGuestId}
                ff="text"
              >
                Assign to Seat {activeSeat}
              </Button>
            </>
          )}

          {error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}
        </Stack>
      </Modal>

      <Group justify="flex-end" mb="lg">
        <Badge size="lg" color="var(--custom-theme-heading)" variant="light" ff="text">
          {assignedCount} / {TOTAL_SEATS} seats assigned
        </Badge>
      </Group>

      {unplaced.length > 0 && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="orange"
          variant="light"
          mb="lg"
          title={`${unplaced.length} guest${unplaced.length === 1 ? '' : 's'} with a seat number outside 1–${TOTAL_SEATS}`}
          ff="text"
        >
          {unplaced.map((g) => `${g.name} (${g.seatNumber})`).join(', ')}
        </Alert>
      )}

      <Table.ScrollContainer minWidth={400} py="xl">
        <Table
          highlightOnHover
          verticalSpacing="sm"
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
              <Table.Th>Seat</Table.Th>
              <Table.Th>Guest</Table.Th>
              <Table.Th>Dietary / Allergies</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
}
