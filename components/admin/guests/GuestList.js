'use client'
import { useRouter } from 'next/navigation';
import { Alert, Table, Badge, Text, Avatar, Group, Drawer, Stack, Box, SimpleGrid, Modal, Button, TextInput } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { IconPhone, IconMail, IconToolsKitchen2, IconAlertCircle, IconTrash, IconSend, IconMusic } from '@tabler/icons-react';
import getGuestInitials from '@/lib/getGuestInitials';
import { deleteGuest, toggleGuestHoop } from '@/actions/guestActions';
import { sendEmailToGuest } from '@/actions/emailActions';

export default function GuestList({ data }) {
  const router = useRouter();
  const { data: guests, error } = data;
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [emailModalOpened, { open: openEmailModal, close: closeEmailModal }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [hoop, setHoop] = useState(false);
  const [hoopLoading, setHoopLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '<p>Dear Guest,</p><p></p><p>We hope this email finds you well.</p><p></p><p>Kind regards,</p><p>Tom & Sam</p>',
    immediatelyRender: false,
  });

  const handleDelete = async () => {
    if (!selectedGuest) return;
    setLoading(true);
    await deleteGuest(selectedGuest.id);
    setLoading(false);
    closeDeleteModal();
    close();
    router.refresh();
  };

  const handleOpenEmailModal = () => {
    if (selectedGuest) {
      editor?.commands.setContent(`<p>Dear ${selectedGuest.firstname},</p><p></p><p>We hope this email finds you well.</p><p></p><p>Kind regards,</p><p>Tom & Sam</p>`);
    }
    openEmailModal();
  };

  const handleCloseEmailModal = () => {
    setEmailSubject('');
    setEmailError(null);
    setEmailSuccess(false);
    closeEmailModal();
  };

  const handleSendEmail = async () => {
    if (!selectedGuest) return;

    if (!emailSubject.trim()) {
      setEmailError('Please enter a subject line');
      return;
    }

    if (!editor?.getHTML() || editor.getHTML() === '<p></p>') {
      setEmailError('Please enter email content');
      return;
    }

    setEmailLoading(true);
    setEmailError(null);

    const response = await sendEmailToGuest(selectedGuest.email, emailSubject.trim(), editor.getHTML());

    if (response.error) {
      setEmailError(response.error.message);
    } else {
      setEmailSuccess(true);
    }

    setEmailLoading(false);
  };

  if (error) {
    return (
      <Alert title="Error Fetching Guests" color="red" variant="filled">
        {error.message}
      </Alert>
    )
  }

  const sortedGuests = [...guests].sort((a, b) => {
    const nameA = (a.surname || a.name || '').toLowerCase();
    const nameB = (b.surname || b.name || '').toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    const firstA = (a.firstname || '').toLowerCase();
    const firstB = (b.firstname || '').toLowerCase();
    return firstA.localeCompare(firstB);
  });

  const handleRowClick = (guest) => {
    setSelectedGuest(guest);
    setHoop(guest.hoop);
    open();
  };

  const handleToggleHoop = async () => {
    if (!selectedGuest) return;
    setHoopLoading(true);
    const response = await toggleGuestHoop(selectedGuest.id, hoop);
    if (!response.error) {
      setHoop(!hoop);
    }
    setHoopLoading(false);
  };

  const getRsvpBadge = (guest) => {
    if (!guest.rsvpStatus) {
      return <Badge color="gray" size="sm" ff="text">Not Replied</Badge>;
    }
    if (guest.rsvpStatus === 'attending') {
      return <Badge color="green" size="sm" ff="text">Attending</Badge>;
    }
    return <Badge color="red" size="sm" ff="text">Not Attending</Badge>;
  };

  const rows = sortedGuests.map((guest) => {
    const initials = getGuestInitials(guest.firstname, guest.surname);
    const attendance = guest.attendanceType === 'reception' ? 'Reception' : 'Ceremony';

    return (
      <Table.Tr
        key={guest.id}
        style={{ cursor: 'pointer' }}
        onClick={() => handleRowClick(guest)}
      >
        <Table.Td>
          <Group gap="sm">
            <Avatar
              size={36}
              radius={36}
              color='var(--custom-theme-text)'
              variant='outline'
            >
              {initials}
            </Avatar>
            <Text fw={500} ff="text" c="var(--custom-theme-heading)">{guest.name}</Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Badge color="var(--custom-theme-heading)" variant="light" size="sm" ff="text">
            {attendance}
          </Badge>
        </Table.Td>
        <Table.Td>{getRsvpBadge(guest)}</Table.Td>
        <Table.Td>
          <Badge color={guest.hasCheckedIn ? 'green' : 'gray'} size="sm" ff="text">
            {guest.hasCheckedIn ? 'Yes' : 'No'}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Badge color={guest.hoop ? 'green' : 'gray'} size="sm" ff="text">
            {guest.hoop ? 'Yes' : 'No'}
          </Badge>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <>
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={<Text fw={700} size="lg" c="var(--custom-theme-heading)" ff="heading">Delete Guest</Text>}
        centered
        zIndex={300}
        styles={{
          content: { backgroundColor: 'var(--custom-theme-fill)' },
          header: { backgroundColor: 'var(--custom-theme-fill)' },
        }}
      >
        <Stack gap="md">
          <Text c="var(--custom-theme-text)" ff="text">
            Are you sure you want to delete {selectedGuest?.name}? This action cannot be undone.
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

      <Modal
        opened={emailModalOpened}
        onClose={handleCloseEmailModal}
        title={<Text fw={700} size="xl" c="var(--custom-theme-heading)" ff="heading">Email {selectedGuest?.firstname}</Text>}
        size="xl"
        centered
        zIndex={300}
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
          <Group justify="space-between">
            <Text size="sm" c="var(--custom-theme-text)" ff="text">
              Sending to:
            </Text>
            <Badge color="var(--custom-theme-heading)" size="lg" ff="text">
              {selectedGuest?.email}
            </Badge>
          </Group>

          <TextInput
            label="Subject"
            placeholder="Enter email subject..."
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            styles={{
              label: {
                color: 'var(--custom-theme-text)',
                fontFamily: 'var(--mantine-font-family)',
              },
            }}
          />

          <div>
            <Text size="sm" c="var(--custom-theme-text)" ff="text" mb="xs">
              Message
            </Text>
            <RichTextEditor
              editor={editor}
              styles={{
                root: {
                  border: '1px solid var(--mantine-color-gray-4)',
                  borderRadius: 'var(--mantine-radius-md)',
                },
                toolbar: {
                  backgroundColor: 'white',
                  borderBottom: '1px solid var(--mantine-color-gray-4)',
                },
                content: {
                  backgroundColor: 'white',
                  minHeight: 200,
                },
              }}
            >
              <RichTextEditor.Toolbar sticky stickyOffset={60}>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Italic />
                  <RichTextEditor.Underline />
                  <RichTextEditor.Strikethrough />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.H1 />
                  <RichTextEditor.H2 />
                  <RichTextEditor.H3 />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.BulletList />
                  <RichTextEditor.OrderedList />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.AlignLeft />
                  <RichTextEditor.AlignCenter />
                  <RichTextEditor.AlignRight />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Link />
                  <RichTextEditor.Unlink />
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>

              <RichTextEditor.Content />
            </RichTextEditor>
          </div>

          {emailError && (
            <Alert color="red" variant="light">
              {emailError}
            </Alert>
          )}

          {emailSuccess && (
            <Alert color="green" variant="light">
              Email sent successfully to {selectedGuest?.name}!
            </Alert>
          )}

          <Group justify="flex-end" mt="md" gap="sm">
            <Button
              variant="outline"
              color="gray"
              onClick={handleCloseEmailModal}
            >
              Cancel
            </Button>
            <Button
              color="var(--custom-theme-heading)"
              leftSection={<IconSend size={18} />}
              onClick={handleSendEmail}
              loading={emailLoading}
            >
              Send Email
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Drawer
        opened={opened}
        onClose={close}
        title={selectedGuest && <Text fw={700} size="xl" c="var(--custom-theme-heading)" ff="heading">{selectedGuest.name}</Text>}
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
        {selectedGuest && <GuestDrawerContent guest={selectedGuest} onDelete={openDeleteModal} onEmail={handleOpenEmailModal} hoop={hoop} hoopLoading={hoopLoading} onToggleHoop={handleToggleHoop} />}
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
              <Table.Th>Guest Type</Table.Th>
              <Table.Th>RSVP</Table.Th>
              <Table.Th>Checked In</Table.Th>
              <Table.Th>Hoop</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
}

function GuestDrawerContent({ guest, onDelete, onEmail, hoop, hoopLoading, onToggleHoop }) {
  const attendance = guest.attendanceType === 'reception' ? 'Reception' : 'Ceremony';

  const getRsvpColor = () => {
    if (!guest.rsvpStatus) return 'gray';
    return guest.rsvpStatus === 'attending' ? 'green' : 'red';
  };

  const getRsvpLabel = () => {
    if (!guest.rsvpStatus) return 'Not Replied';
    return guest.rsvpStatus === 'attending' ? 'Attending' : 'Not Attending';
  };

  const section = {
    backgroundColor: 'white',
    border: '1px solid var(--mantine-color-gray-2)',
    borderRadius: 'var(--mantine-radius-md)',
    padding: 'var(--mantine-spacing-md)',
  };

  const sectionLabel = { size: 'xs', c: 'dimmed', ff: 'text', tt: 'uppercase', fw: 700, mb: 8 };

  return (
    <Stack gap="sm" pt="md">

      {/* Status */}
      <SimpleGrid cols={2} spacing="sm">
        <Box style={section}>
          <Text {...sectionLabel}>Guest Type</Text>
          <Badge color="var(--custom-theme-heading)" variant="light" ff="text">{attendance}</Badge>
        </Box>
        <Box style={section}>
          <Text {...sectionLabel}>RSVP</Text>
          <Badge color={getRsvpColor()} ff="text">{getRsvpLabel()}</Badge>
        </Box>
        <Box style={section}>
          <Text {...sectionLabel}>Checked In</Text>
          <Badge color={guest.hasCheckedIn ? 'green' : 'gray'} ff="text">{guest.hasCheckedIn ? 'Yes' : 'No'}</Badge>
        </Box>
        <Box style={section}>
          <Text {...sectionLabel}>Hoop</Text>
          <Group gap="xs" align="center">
            <Badge color={hoop ? 'green' : 'gray'} ff="text">{hoop ? 'Yes' : 'No'}</Badge>
            <Button size="compact-xs" variant="subtle" color={hoop ? 'red' : 'green'} onClick={onToggleHoop} loading={hoopLoading} ff="text">
              {hoop ? 'Remove' : 'Add'}
            </Button>
          </Group>
        </Box>
      </SimpleGrid>

      {/* Contact */}
      <Box style={section}>
        <Text {...sectionLabel}>Contact</Text>
        <Stack gap="xs">
          <Group gap="sm">
            <IconPhone size={15} color="var(--mantine-color-gray-5)" />
            <Text size="sm" c={guest.phone ? 'var(--custom-theme-text)' : 'dimmed'} ff="text" fs={guest.phone ? undefined : 'italic'}>{guest.phone || 'No phone number'}</Text>
          </Group>
          <Group gap="sm">
            <IconMail size={15} color="var(--mantine-color-gray-5)" />
            <Text size="sm" c={guest.email ? 'var(--custom-theme-text)' : 'dimmed'} ff="text" fs={guest.email ? undefined : 'italic'}>{guest.email || 'No email address'}</Text>
          </Group>
        </Stack>
      </Box>

      {/* Menu */}
      <Box style={section}>
        <Text {...sectionLabel}>Menu</Text>
        <Stack gap="xs">
          {[['Starter', guest.starter], ['Main', guest.main], ['Dessert', guest.dessert], ['Evening Meal', guest.eveningMeal]].map(([label, value]) => (
            <Group key={label} justify="space-between">
              <Text size="sm" c="dimmed" ff="text">{label}</Text>
              <Text size="sm" c={value ? 'var(--custom-theme-heading)' : 'dimmed'} ff="text" fw={value ? 600 : 400} fs={value ? undefined : 'italic'} tt="capitalize">{value || '—'}</Text>
            </Group>
          ))}
        </Stack>
      </Box>

      {/* Dietary */}
      <Box style={section}>
        <Text {...sectionLabel}>Dietary</Text>
        <Stack gap="xs">
          <Group gap="sm" align="flex-start">
            <IconToolsKitchen2 size={15} color="var(--mantine-color-gray-5)" style={{ marginTop: 2 }} />
            <Text size="sm" c={guest.dietry ? 'var(--custom-theme-text)' : 'dimmed'} ff="text" fs={guest.dietry ? undefined : 'italic'}>{guest.dietry || 'No requirements'}</Text>
          </Group>
          <Group gap="sm" align="flex-start">
            <IconAlertCircle size={15} color={guest.allergies ? 'red' : 'var(--mantine-color-gray-5)'} style={{ marginTop: 2 }} />
            <Text size="sm" c={guest.allergies ? 'var(--custom-theme-text)' : 'dimmed'} ff="text" fs={guest.allergies ? undefined : 'italic'}>{guest.allergies || 'No allergies'}</Text>
          </Group>
        </Stack>
      </Box>

      {/* Song Request */}
      <Box style={section}>
        <Text {...sectionLabel}>Song Request</Text>
        <Group gap="sm">
          <IconMusic size={15} color="var(--mantine-color-gray-5)" />
          <Text size="sm" c={guest.songRequest ? 'var(--custom-theme-text)' : 'dimmed'} ff="text" fs={guest.songRequest ? undefined : 'italic'}>{guest.songRequest || 'No request'}</Text>
        </Group>
      </Box>

      {/* Actions */}
      <Group grow gap="sm" mt="xs">
        {guest.email && (
          <Button variant="outline" color="var(--custom-theme-heading)" leftSection={<IconSend size={15} />} onClick={onEmail} ff="text">
            Email
          </Button>
        )}
        <Button variant="outline" color="red" leftSection={<IconTrash size={15} />} onClick={onDelete} ff="text">
          Delete
        </Button>
      </Group>

    </Stack>
  );
}
