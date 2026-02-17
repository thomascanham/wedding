'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Button, Paper, Text, Group, ThemeIcon, Tooltip, Drawer, Stack, Badge, Divider, Modal, TextInput, Alert } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { IconMapPin, IconMapPinFilled, IconUser, IconUserCheck, IconUserOff, IconPhone, IconMail, IconToolsKitchen2, IconAlertCircle, IconTrash, IconSend, IconCircle } from '@tabler/icons-react';
import getGuestInitials from '@/lib/getGuestInitials';
import { deleteGuest, toggleGuestHoop } from '@/actions/guestActions';
import { sendEmailToGuest } from '@/actions/emailActions';

export function GuestCard({ guest }) {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [emailModalOpened, { open: openEmailModal, close: closeEmailModal }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [hoop, setHoop] = useState(guest.hoop);
  const [hoopLoading, setHoopLoading] = useState(false);
  const attendance = guest.attendanceType === 'reception' ? 'Reception' : 'Ceremony';
  const initials = getGuestInitials(guest.firstname, guest.surname);

  const handleToggleHoop = async () => {
    setHoopLoading(true);
    const response = await toggleGuestHoop(guest.id, hoop);
    if (!response.error) {
      setHoop(!hoop);
    }
    setHoopLoading(false);
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: `<p>Dear ${guest.firstname},</p><p></p><p>We hope this email finds you well.</p><p></p><p>Kind regards,</p><p>Tom & Sam</p>`,
    immediatelyRender: false,
  });

  const handleDelete = async () => {
    setLoading(true);
    await deleteGuest(guest.id);
    setLoading(false);
    closeDeleteModal();
    close();
    router.refresh();
  };

  const handleCloseEmailModal = () => {
    setEmailSubject('');
    setEmailError(null);
    setEmailSuccess(false);
    editor?.commands.setContent(`<p>Dear ${guest.firstname},</p><p></p><p>We hope this email finds you well.</p><p></p><p>Kind regards,</p><p>Tom & Sam</p>`);
    closeEmailModal();
  };

  const handleSendEmail = async () => {
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

    const response = await sendEmailToGuest(guest.email, emailSubject.trim(), editor.getHTML());

    if (response.error) {
      setEmailError(response.error.message);
    } else {
      setEmailSuccess(true);
    }

    setEmailLoading(false);
  };

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
            Are you sure you want to delete {guest.name}? This action cannot be undone.
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
        title={<Text fw={700} size="xl" c="var(--custom-theme-heading)" ff="heading">Email {guest.firstname}</Text>}
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
              {guest.email}
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
              Email sent successfully to {guest.name}!
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
        title={<Text fw={700} size="xl" c="var(--custom-theme-heading)" ff="heading">{guest.name}</Text>}
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
        <GuestDrawerContent guest={guest} onDelete={openDeleteModal} onEmail={openEmailModal} hoop={hoop} hoopLoading={hoopLoading} onToggleHoop={handleToggleHoop} />
      </Drawer>

      <Paper shadow="md" radius="md" withBorder p="lg" bg="white" style={{ border: '2px solid var(--custom-theme-heading)' }}>
        <Avatar
          size={60}
          radius={60}
          mx="auto"
          color='var(--custom-theme-text)'
          variant='outline'
        >{initials}</Avatar>
        <Text ta="center" fz="lg" fw={500} mt="md" ff={'text'} c="var(--custom-theme-heading)">
          {guest.name}
        </Text>
        <Text ta="center" c="dimmed" fz="sm" ff={'text'}>
          {attendance}
        </Text>

        <StatusIcons guest={guest} hoop={hoop} />

        <Button fullWidth my="md" onClick={open} color='var(--custom-theme-heading)' variant='outline' ff="text">
          View Guest
        </Button>
      </Paper>
    </>
  );
}

function GuestDrawerContent({ guest, onDelete, onEmail, hoop, hoopLoading, onToggleHoop }) {
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

      <Group justify="space-between">
        <Text size="md" c="var(--custom-theme-text)" ff="text" fw={500}>Hoop</Text>
        <Group gap="sm">
          <Badge color={hoop ? 'green' : 'gray'} size="lg" ff="text">
            {hoop ? 'Yes' : 'No'}
          </Badge>
          <Button
            size="xs"
            variant="outline"
            color={hoop ? 'red' : 'green'}
            onClick={onToggleHoop}
            loading={hoopLoading}
            ff="text"
          >
            {hoop ? 'Remove' : 'Add'}
          </Button>
        </Group>
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

function StatusIcons({ guest, hoop }) {
  const hasReplied = !!guest.rsvpStatus;
  const isAttending = guest.rsvpStatus === 'attending';
  const hasCheckedIn = guest.hasCheckedIn;

  const getRsvpColor = () => {
    if (!hasReplied) return 'gray';
    return isAttending ? 'green' : 'red';
  };

  const getRsvpLabel = () => {
    if (!hasReplied) return 'Not Replied';
    return isAttending ? 'Attending' : 'Not Attending';
  };

  return (
    <Group justify='center' pt="md">
      <Tooltip label={hasCheckedIn ? 'Checked In' : 'Not Checked In'}>
        <ThemeIcon variant="transparent" size="md" color={hasCheckedIn ? 'green' : 'gray'}>
          {hasCheckedIn
            ? <IconMapPinFilled style={{ width: '70%', height: '70%' }} />
            : <IconMapPin style={{ width: '70%', height: '70%' }} />
          }
        </ThemeIcon>
      </Tooltip>

      <Tooltip label={getRsvpLabel()}>
        <ThemeIcon variant="transparent" size="md" color={getRsvpColor()}>
          {!hasReplied
            ? <IconUser style={{ width: '70%', height: '70%' }} />
            : isAttending
              ? <IconUserCheck style={{ width: '70%', height: '70%' }} />
              : <IconUserOff style={{ width: '70%', height: '70%' }} />
          }
        </ThemeIcon>
      </Tooltip>

      <Tooltip label={hoop ? 'Hoop' : 'No Hoop'}>
        <ThemeIcon variant="transparent" size="md" color={hoop ? 'green' : 'gray'}>
          <IconCircle style={{ width: '70%', height: '70%' }} />
        </ThemeIcon>
      </Tooltip>
    </Group>
  )
}