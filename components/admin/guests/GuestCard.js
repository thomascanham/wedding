'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Button, Paper, Text, Group, ThemeIcon, Tooltip, Drawer, Stack, Badge, Box, SimpleGrid, Modal, TextInput, Alert } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { IconMapPin, IconMapPinFilled, IconUser, IconUserCheck, IconUserOff, IconPhone, IconMail, IconToolsKitchen2, IconAlertCircle, IconTrash, IconSend, IconCircle, IconMusic } from '@tabler/icons-react';
import getGuestInitials from '@/lib/getGuestInitials';
import { deleteGuest, toggleGuestHoop } from '@/actions/guestActions';
import { sendEmailToGuest } from '@/actions/emailActions';

export function GuestCard({ guest, onInvite = false }) {
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
  useEffect(() => { setHoop(guest.hoop); }, [guest.hoop]);
  const attendance = guest.attendanceType === 'reception' ? 'Reception' : 'Ceremony';
  const initials = getGuestInitials(guest.firstname, guest.surname);

  const handleToggleHoop = async () => {
    setHoopLoading(true);
    const response = await toggleGuestHoop(guest.id, hoop);
    if (!response.error) {
      setHoop(!hoop);
    }
    setHoopLoading(false);
    router.refresh();
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

        <StatusIcons guest={guest} hoop={hoop} onInvite={onInvite} />

        <Button fullWidth my="md" onClick={open} color='var(--custom-theme-heading)' variant='outline' ff="text">
          View Guest
        </Button>
      </Paper>
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

function StatusIcons({ guest, hoop, onInvite }) {
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

      <Tooltip label={onInvite ? 'On an invite' : 'Not on an invite'}>
        <Box
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: onInvite ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-gray-4)',
            flexShrink: 0,
          }}
        />
      </Tooltip>
    </Group>
  )
}