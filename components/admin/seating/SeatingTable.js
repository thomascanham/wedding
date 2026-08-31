'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Group, Badge, Table, Text, Alert, Stack, Modal, Select, Button, ActionIcon, TextInput } from "@mantine/core";
import { IconAlertCircle, IconToolsKitchen2, IconArmchair, IconPencil } from "@tabler/icons-react";
import { updateGuestSeatNumber } from "@/actions/guestActions";
import { updateSeatingTableName } from "@/actions/seatingActions";

const TOTAL_SEATS = 60;

const DESSERT_LABELS = {
  cheesecake: 'Baked Vanilla Cheesecake',
  sticky_toffee: 'Sticky Toffee Pudding',
};

export default function SeatingTable({ guests, tableNames = [] }) {
  const router = useRouter();
  const [activeSeat, setActiveSeat] = useState(null);
  const [selectedGuestId, setSelectedGuestId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editingTableIndex, setEditingTableIndex] = useState(null);
  const [tableNameInput, setTableNameInput] = useState('');
  const [savingTableName, setSavingTableName] = useState(false);
  const [tableNameError, setTableNameError] = useState(null);

  const tableNameMap = new Map(tableNames.map((t) => [t.tableIndex, t.name]));

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

  const getTableLabel = (tableIndex) => {
    const base = `Table ${tableIndex}`;
    const name = tableNameMap.get(tableIndex);
    return name ? `${base} — ${name}` : base;
  };

  const openTableNameEditor = (tableIndex) => {
    setEditingTableIndex(tableIndex);
    setTableNameInput(tableNameMap.get(tableIndex) || '');
    setTableNameError(null);
  };

  const closeTableNameEditor = () => {
    setEditingTableIndex(null);
    setTableNameInput('');
    setTableNameError(null);
  };

  const handleSaveTableName = async () => {
    if (editingTableIndex === null) return;
    setSavingTableName(true);
    setTableNameError(null);
    const response = await updateSeatingTableName(editingTableIndex, tableNameInput);
    setSavingTableName(false);
    if (response.error) {
      setTableNameError(response.error.message);
      return;
    }
    closeTableNameEditor();
    router.refresh();
  };

  const rows = [];
  Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1).forEach((seatNum) => {
    if ((seatNum - 1) % 10 === 0) {
      const tableIndex = Math.floor((seatNum - 1) / 10);
      rows.push(
        <Table.Tr key={`table-${seatNum}`}>
          <Table.Td
            colSpan={4}
            style={{
              backgroundColor: 'var(--custom-theme-fill)',
              paddingTop: seatNum === 1 ? undefined : 'var(--mantine-spacing-lg)',
            }}
          >
            <Group gap={6} wrap="nowrap">
              <Text fw={700} ff="heading" c="var(--custom-theme-heading)" tt="uppercase" size="sm">
                {getTableLabel(tableIndex)}
              </Text>
              <ActionIcon
                variant="subtle"
                color="var(--custom-theme-heading)"
                size="sm"
                onClick={() => openTableNameEditor(tableIndex)}
                aria-label={`Edit name for Table ${tableIndex}`}
              >
                <IconPencil size={14} />
              </ActionIcon>
            </Group>
          </Table.Td>
        </Table.Tr>
      );
    }

    const guest = seatMap.get(seatNum);

    rows.push(
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
        <Table.Td>
          {guest && (
            guest.dessert ? (
              <Text size="sm" ff="text" c="var(--custom-theme-text)">{DESSERT_LABELS[guest.dessert] || guest.dessert}</Text>
            ) : (
              <Text size="sm" fs="italic" c="dimmed" ff="text">—</Text>
            )
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

      <Modal
        opened={editingTableIndex !== null}
        onClose={closeTableNameEditor}
        title={<Text fw={700} size="xl" c="var(--custom-theme-heading)" ff="heading">Table {editingTableIndex}</Text>}
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
          <TextInput
            label="Table name"
            placeholder="e.g. Top Table"
            value={tableNameInput}
            onChange={(event) => setTableNameInput(event.currentTarget.value)}
            styles={{ label: { color: 'var(--custom-theme-text)' } }}
          />
          <Button
            color="var(--custom-theme-heading)"
            onClick={handleSaveTableName}
            loading={savingTableName}
            ff="text"
          >
            Save
          </Button>
          {tableNameError && (
            <Alert color="red" variant="light">
              {tableNameError}
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
              <Table.Th>Dessert</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
}
