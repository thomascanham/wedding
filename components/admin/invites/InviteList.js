'use client'
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Table, Badge, Text, Group, Drawer, Stack, Divider, Button, MultiSelect, Select, Modal, TextInput, Box, Center } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { IconUsers, IconTrash, IconMail, IconMailOff, IconQrcode } from '@tabler/icons-react';
import { updateInvite, deleteInvite, addGuestToInvite, generateQRCode, deleteQRCode } from '@/actions/inviteActions';

export default function InviteList({ data, allGuests }) {
  const router = useRouter();
  const { data: invites, error } = data;
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [inviteName, setInviteName] = useState('');
  const [selectedGuests, setSelectedGuests] = useState([]);
  const [attendance, setAttendance] = useState('ceremony');
  const [loading, setLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrSvg, setQrSvg] = useState(null);

  if (error) {
    return (
      <Alert title="Error Fetching Invites" color="red" variant="filled">
        {error.message}
      </Alert>
    )
  }

  const sortedInvites = [...invites].sort((a, b) => {
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

  const handleRowClick = (invite) => {
    setSelectedInvite(invite);
    setInviteName(invite.name || '');
    setSelectedGuests(invite.guest || []);
    setAttendance(invite.attendance || 'ceremony');
    setQrSvg(invite.qr_svg || null);
    open();
  };

  const handleSaveChanges = async () => {
    if (!selectedInvite) return;
    setLoading(true);
    await updateInvite(selectedInvite.id, { name: inviteName, attendance });
    await addGuestToInvite(selectedInvite.id, selectedGuests);
    setLoading(false);
    close();
    router.refresh();
  };

  const handleToggleSent = async () => {
    if (!selectedInvite) return;
    setLoading(true);
    await updateInvite(selectedInvite.id, { sent: !selectedInvite.sent });
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!selectedInvite) return;
    setLoading(true);
    await deleteInvite(selectedInvite.id);
    setLoading(false);
    closeDeleteModal();
    close();
    router.refresh();
  };

  const handleGenerateQR = async () => {
    if (!selectedInvite) return;
    setQrLoading(true);
    const baseUrl = window.location.origin;
    const result = await generateQRCode(selectedInvite.id, baseUrl);
    if (result.data?.qr_svg) {
      setQrSvg(result.data.qr_svg);
    }
    setQrLoading(false);
    router.refresh();
  };

  const handleDeleteQR = async () => {
    if (!selectedInvite) return;
    setQrLoading(true);
    await deleteQRCode(selectedInvite.id);
    setQrSvg(null);
    setQrLoading(false);
    router.refresh();
  };

  const rows = sortedInvites.map((invite) => {
    const expandedGuests = invite.expand?.guest || [];
    const guestCount = expandedGuests.length;

    return (
      <Table.Tr
        key={invite.id}
        style={{ cursor: 'pointer' }}
        onClick={() => handleRowClick(invite)}
      >
        <Table.Td>
          <Text fw={500} ff="text" c="var(--custom-theme-heading)">{invite.name}</Text>
        </Table.Td>
        <Table.Td>
          <Badge color="var(--custom-theme-heading)" variant="light" size="sm" ff="text">
            {invite.attendance === 'reception' ? 'Reception' : 'Ceremony'}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Group gap="xs">
            <IconUsers size={16} color="var(--custom-theme-text)" />
            <Text size="sm" c="var(--custom-theme-text)" ff="text">
              {guestCount}
            </Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Badge color={invite.sent ? 'green' : 'gray'} size="sm" ff="text">
            {invite.sent ? 'Sent' : 'Not Sent'}
          </Badge>
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
        title={<Text fw={700} size="lg" c="var(--custom-theme-heading)" ff="heading">Delete Invite</Text>}
        centered
        zIndex={300}
        styles={{
          content: { backgroundColor: 'var(--custom-theme-fill)' },
          header: { backgroundColor: 'var(--custom-theme-fill)' },
        }}
      >
        <Stack gap="md">
          <Text c="var(--custom-theme-text)" ff="text">
            Are you sure you want to delete "{selectedInvite?.name}"? This action cannot be undone.
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
        title={selectedInvite && <Text fw={700} size="xl" c="var(--custom-theme-heading)" ff="heading">{selectedInvite.name}</Text>}
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
        {selectedInvite && (
          <Stack gap="lg" pt="md">
            <Group justify="space-between">
              <Text size="md" c="var(--custom-theme-text)" ff="text" fw={500}>Status</Text>
              <Badge color={selectedInvite.sent ? 'green' : 'gray'} size="lg" ff="text">
                {selectedInvite.sent ? 'Sent' : 'Not Sent'}
              </Badge>
            </Group>

            <TextInput
              label="Invite Name"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              styles={labelStyles}
            />

            <Select
              label="Attendance Type"
              value={attendance}
              onChange={setAttendance}
              data={[
                { label: 'Ceremony', value: 'ceremony' },
                { label: 'Reception', value: 'reception' },
              ]}
              styles={labelStyles}
            />

            <Divider label="Guests" labelPosition="left" styles={dividerStyles} />

            <MultiSelect
              label="Select Guests"
              placeholder="Choose guests for this invite"
              data={guestOptions}
              value={selectedGuests}
              onChange={setSelectedGuests}
              searchable
              clearable
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

            <Divider label="QR Code" labelPosition="left" styles={dividerStyles} />

            {qrSvg && (
              <Center>
                <Box
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              </Center>
            )}

            <Button
              variant="outline"
              color="var(--custom-theme-heading)"
              leftSection={<IconQrcode size={18} />}
              onClick={handleGenerateQR}
              loading={qrLoading}
              fullWidth
            >
              {qrSvg ? 'Regenerate QR Code' : 'Generate QR Code'}
            </Button>

            {qrSvg && (
              <Button
                variant="light"
                color="red"
                leftSection={<IconTrash size={18} />}
                onClick={handleDeleteQR}
                loading={qrLoading}
                fullWidth
              >
                Delete QR Code
              </Button>
            )}

            <Divider label="Actions" labelPosition="left" styles={dividerStyles} />

            <Button
              variant="outline"
              color={selectedInvite.sent ? 'gray' : 'green'}
              leftSection={selectedInvite.sent ? <IconMailOff size={18} /> : <IconMail size={18} />}
              onClick={handleToggleSent}
              loading={loading}
              fullWidth
            >
              {selectedInvite.sent ? 'Mark as Not Sent' : 'Mark as Sent'}
            </Button>

            <Button
              variant="outline"
              color="red"
              leftSection={<IconTrash size={18} />}
              onClick={openDeleteModal}
              fullWidth
            >
              Delete Invite
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
              <Table.Th>Attendance</Table.Th>
              <Table.Th>Guests</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
}
