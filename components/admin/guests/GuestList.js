'use client'
import { useRouter } from 'next/navigation';
import { Alert, Table, Badge, Text, Avatar, Group, Drawer, Stack, Divider, Modal, Button, TextInput } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { IconPhone, IconMail, IconToolsKitchen2, IconAlertCircle, IconTrash, IconSend } from '@tabler/icons-react';
import getGuestInitials from '@/lib/getGuestInitials';
import { deleteGuest } from '@/actions/guestActions';
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
    open();
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
        {selectedGuest && <GuestDrawerContent guest={selectedGuest} onDelete={openDeleteModal} onEmail={handleOpenEmailModal} />}
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
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
}

function GuestDrawerContent({ guest, onDelete, onEmail }) {
  const attendance = guest.attendanceType === 'reception' ? 'Reception' : 'Ceremony';

  const getRsvpBadge = () => {
    if (!guest.rsvpStatus) {
      return <Badge color="gray" size="lg" ff="text">Not Replied</Badge>;
    }
    if (guest.rsvpStatus === 'attending') {
      return <Badge color="green" size="lg" ff="text">Attending</Badge>;
    }
    return <Badge color="red" size="lg" ff="text">Not Attending</Badge>;
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
    <Stack gap="lg" pt="md">
      <Group justify="space-between">
        <Text size="md" c="var(--custom-theme-text)" ff="text" fw={500}>Guest Type</Text>
        <Badge color="var(--custom-theme-heading)" variant="light" size="lg" ff="text">{attendance}</Badge>
      </Group>

      <Group justify="space-between">
        <Text size="md" c="var(--custom-theme-text)" ff="text" fw={500}>RSVP Status</Text>
        {getRsvpBadge()}
      </Group>

      <Group justify="space-between">
        <Text size="md" c="var(--custom-theme-text)" ff="text" fw={500}>Checked In</Text>
        <Badge color={guest.hasCheckedIn ? 'green' : 'gray'} size="lg" ff="text">
          {guest.hasCheckedIn ? 'Yes' : 'No'}
        </Badge>
      </Group>

      <Divider label="Contact" labelPosition="left" styles={dividerStyles} />

      {guest.phone && (
        <Group gap="sm">
          <IconPhone size={20} color="var(--custom-theme-text)" />
          <Text size="md" c="var(--custom-theme-text)" ff="text">{guest.phone}</Text>
        </Group>
      )}

      {guest.email && (
        <Group gap="sm">
          <IconMail size={20} color="var(--custom-theme-text)" />
          <Text size="md" c="var(--custom-theme-text)" ff="text">{guest.email}</Text>
        </Group>
      )}

      {!guest.phone && !guest.email && (
        <Text size="md" c="var(--custom-theme-text)" ff="text" fs="italic">No contact information</Text>
      )}

      <Divider label="Menu Choices" labelPosition="left" styles={dividerStyles} />

      <Group justify="space-between">
        <Text size="md" c="var(--custom-theme-text)" ff="text" fw={500}>Starter</Text>
        <Text size="md" c="var(--custom-theme-heading)" ff="text" fw={600} tt="capitalize">{guest.starter || '—'}</Text>
      </Group>

      <Group justify="space-between">
        <Text size="md" c="var(--custom-theme-text)" ff="text" fw={500}>Main</Text>
        <Text size="md" c="var(--custom-theme-heading)" ff="text" fw={600} tt="capitalize">{guest.main || '—'}</Text>
      </Group>

      <Group justify="space-between">
        <Text size="md" c="var(--custom-theme-text)" ff="text" fw={500}>Dessert</Text>
        <Text size="md" c="var(--custom-theme-heading)" ff="text" fw={600} tt="capitalize">{guest.dessert || '—'}</Text>
      </Group>

      {(guest.dietry || guest.allergies) && (
        <>
          <Divider label="Dietary Requirements" labelPosition="left" styles={dividerStyles} />

          {guest.dietry && (
            <Group gap="sm" align="flex-start">
              <IconToolsKitchen2 size={20} color="var(--custom-theme-text)" />
              <Text size="md" c="var(--custom-theme-text)" ff="text">{guest.dietry}</Text>
            </Group>
          )}

          {guest.allergies && (
            <Group gap="sm" align="flex-start">
              <IconAlertCircle size={20} color="red" />
              <Text size="md" c="var(--custom-theme-text)" ff="text">{guest.allergies}</Text>
            </Group>
          )}
        </>
      )}

      <Divider label="Actions" labelPosition="left" styles={dividerStyles} />

      {guest.email && (
        <Button
          variant="outline"
          color="var(--custom-theme-heading)"
          leftSection={<IconSend size={18} />}
          onClick={onEmail}
          fullWidth
        >
          Send Email
        </Button>
      )}

      <Button
        variant="outline"
        color="red"
        leftSection={<IconTrash size={18} />}
        onClick={onDelete}
        fullWidth
      >
        Delete Guest
      </Button>
    </Stack>
  );
}
