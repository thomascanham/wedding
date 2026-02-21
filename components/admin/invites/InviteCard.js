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
  ActionIcon,
  Drawer,
  MultiSelect,
  Select,
  Divider,
  Tooltip,
  Modal,
  TextInput,
  Box,
  Center,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMail, IconMailOff, IconTrash, IconUsers, IconQrcode } from '@tabler/icons-react';
import { updateInvite, deleteInvite, addGuestToInvite, generateQRCode, deleteQRCode } from '@/actions/inviteActions';
import getGuestInitials from '@/lib/getGuestInitials';

export default function InviteCard({ invite, allGuests, allInvites = [] }) {
  const router = useRouter();
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [inviteName, setInviteName] = useState(invite.name || '');
  const [selectedGuests, setSelectedGuests] = useState(invite.guest || []);
  const [attendance, setAttendance] = useState(invite.attendance || 'ceremony');
  const [loading, setLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrSvg, setQrSvg] = useState(invite.qr_svg || null);

  const expandedGuests = invite.expand?.guest || [];
  const guestCount = expandedGuests.length;

  // Guests assigned to other invites (not this one)
  const otherAssignedIds = new Set(
    allInvites
      .filter((inv) => inv.id !== invite.id)
      .flatMap((inv) => inv.guest || [])
  );

  const guestOptions = allGuests
    .filter((guest) => guest.id && guest.name && !otherAssignedIds.has(guest.id))
    .map((guest) => ({
      value: guest.id,
      label: guest.name,
    }));

  const handleToggleSent = async () => {
    setLoading(true);
    await updateInvite(invite.id, { sent: !invite.sent });
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async () => {
    setLoading(true);
    await deleteInvite(invite.id);
    setLoading(false);
    closeDeleteModal();
    router.refresh();
  };

  const handleOpenDrawer = () => {
    setInviteName(invite.name || '');
    setSelectedGuests(invite.guest || []);
    setAttendance(invite.attendance || 'ceremony');
    openDrawer();
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    await updateInvite(invite.id, { name: inviteName, attendance });
    await addGuestToInvite(invite.id, selectedGuests);
    setLoading(false);
    closeDrawer();
    router.refresh();
  };

  const handleGenerateQR = async () => {
    setQrLoading(true);
    const baseUrl = window.location.origin;
    const result = await generateQRCode(invite.id, baseUrl);
    if (result.data?.qr_svg) {
      setQrSvg(result.data.qr_svg);
    }
    setQrLoading(false);
    router.refresh();
  };

  const handleDeleteQR = async () => {
    setQrLoading(true);
    await deleteQRCode(invite.id);
    setQrSvg(null);
    setQrLoading(false);
    router.refresh();
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
            Are you sure you want to delete the invite "{invite.name}"? This action cannot be undone.
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
        title={<Text fw={700} size="xl" c="var(--custom-theme-heading)" ff="heading">{invite.name}</Text>}
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
          <Group justify="space-between">
            <Text size="md" c="var(--custom-theme-text)" ff="text" fw={500}>Status</Text>
            <Badge color={invite.sent ? 'green' : 'gray'} size="lg" ff="text">
              {invite.sent ? 'Sent' : 'Not Sent'}
            </Badge>
          </Group>

          <TextInput
            label="Invite Name"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            styles={{
              label: {
                color: 'var(--custom-theme-text)',
                fontFamily: 'var(--mantine-font-family)',
              },
            }}
          />

          <Select
            label="Attendance Type"
            value={attendance}
            onChange={setAttendance}
            data={[
              { label: 'Ceremony', value: 'ceremony' },
              { label: 'Reception', value: 'reception' },
            ]}
            comboboxProps={{ zIndex: 1000 }}
            styles={{
              label: {
                color: 'var(--custom-theme-text)',
                fontFamily: 'var(--mantine-font-family)',
              },
            }}
          />

          <Divider
            label="Guests"
            labelPosition="left"
            styles={{
              label: {
                color: 'var(--custom-theme-heading)',
                fontWeight: 600,
                fontSize: 'var(--mantine-font-size-md)',
                fontFamily: 'var(--mantine-font-family-headings)',
              },
            }}
          />

          <MultiSelect
            label="Select Guests"
            placeholder="Choose guests for this invite"
            data={guestOptions}
            value={selectedGuests}
            onChange={setSelectedGuests}
            searchable
            clearable
            comboboxProps={{ zIndex: 1000 }}
            styles={{
              label: {
                color: 'var(--custom-theme-text)',
                fontFamily: 'var(--mantine-font-family)',
              },
            }}
          />

          {selectedGuests.length > 0 && (
            <Stack gap="xs">
              <Text size="sm" c="var(--custom-theme-text)" ff="text" fw={500}>
                Selected: {selectedGuests.length} guest{selectedGuests.length !== 1 ? 's' : ''}
              </Text>
            </Stack>
          )}

          <Button
            color="var(--custom-theme-heading)"
            onClick={handleSaveChanges}
            loading={loading}
            fullWidth
          >
            Save Changes
          </Button>

          <Divider
            label="QR Code"
            labelPosition="left"
            styles={{
              label: {
                color: 'var(--custom-theme-heading)',
                fontWeight: 600,
                fontSize: 'var(--mantine-font-size-md)',
                fontFamily: 'var(--mantine-font-family-headings)',
              },
            }}
          />

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

          <Divider
            label="Actions"
            labelPosition="left"
            styles={{
              label: {
                color: 'var(--custom-theme-heading)',
                fontWeight: 600,
                fontSize: 'var(--mantine-font-size-md)',
                fontFamily: 'var(--mantine-font-family-headings)',
              },
            }}
          />

          <Button
            variant="outline"
            color={invite.sent ? 'gray' : 'green'}
            leftSection={invite.sent ? <IconMailOff size={18} /> : <IconMail size={18} />}
            onClick={handleToggleSent}
            loading={loading}
            fullWidth
          >
            {invite.sent ? 'Mark as Not Sent' : 'Mark as Sent'}
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
            {invite.name}
          </Text>
          <Group gap="xs">
            <Badge color="var(--custom-theme-heading)" variant="light" size="sm" ff="text">
              {invite.attendance === 'reception' ? 'Reception' : 'Ceremony'}
            </Badge>
            <Badge color={invite.sent ? 'green' : 'gray'} size="sm" ff="text">
              {invite.sent ? 'Sent' : 'Not Sent'}
            </Badge>
          </Group>
        </Group>

        <Group gap="xs" mb="md">
          <IconUsers size={18} color="var(--custom-theme-text)" />
          <Text size="sm" c="var(--custom-theme-text)" ff="text">
            {guestCount} guest{guestCount !== 1 ? 's' : ''}
          </Text>
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
          Manage Invite
        </Button>
      </Paper>
    </>
  );
}
