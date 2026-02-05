'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Paper,
  Text,
  Group,
  Button,
  Stack,
  Modal,
  TextInput,
  Alert,
  Badge,
  Divider,
  Card,
  SimpleGrid,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { IconMail, IconSend, IconUsers, IconTestPipe } from '@tabler/icons-react';
import { sendEmailToAllGuests, sendTestEmail } from '@/actions/emailActions';

export default function CommsManager({ guestsWithEmail }) {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '<p>Dear Guest,</p><p></p><p>We hope this email finds you well.</p><p></p><p>Kind regards,</p><p>The Wedding Team</p>',
    immediatelyRender: false,
  });

  const guestCount = guestsWithEmail?.length || 0;

  const handleClose = () => {
    setSubject('');
    setResult(null);
    setError(null);
    editor?.commands.setContent('<p>Dear Guest,</p><p></p><p>We hope this email finds you well.</p><p></p><p>Kind regards,</p><p>The Wedding Team</p>');
    close();
  };

  const handleSendToAll = async () => {
    if (!subject.trim()) {
      setError('Please enter a subject line');
      return;
    }

    if (!editor?.getHTML() || editor.getHTML() === '<p></p>') {
      setError('Please enter email content');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const response = await sendEmailToAllGuests(subject.trim(), editor.getHTML());

    if (response.error) {
      setError(response.error.message);
    } else {
      setResult(response);
    }

    setLoading(false);
  };

  const handleSendTest = async () => {
    if (!subject.trim()) {
      setError('Please enter a subject line');
      return;
    }

    if (!editor?.getHTML() || editor.getHTML() === '<p></p>') {
      setError('Please enter email content');
      return;
    }

    setTestLoading(true);
    setError(null);

    const response = await sendTestEmail(process.env.NEXT_PUBLIC_TEST_EMAIL, subject.trim(), editor.getHTML());

    if (response.error) {
      setError(`Test email failed: ${response.error.message}`);
    } else {
      setError(null);
      alert('Test email sent successfully!');
    }

    setTestLoading(false);
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
        opened={opened}
        onClose={handleClose}
        title={<Text fw={700} size="xl" c="var(--custom-theme-heading)" ff="heading">Compose Email</Text>}
        size="xl"
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
          <Group justify="space-between">
            <Text size="sm" c="var(--custom-theme-text)" ff="text">
              Sending to:
            </Text>
            <Badge color="var(--custom-theme-heading)" size="lg" ff="text">
              {guestCount} guest{guestCount !== 1 ? 's' : ''} with email
            </Badge>
          </Group>

          <TextInput
            label="Subject"
            placeholder="Enter email subject..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            styles={labelStyles}
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

          {error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}

          {result && (
            <Alert color={result.failed > 0 ? 'yellow' : 'green'} variant="light">
              <Text fw={500}>
                Successfully sent to {result.sent} guest{result.sent !== 1 ? 's' : ''}
                {result.failed > 0 && ` (${result.failed} failed)`}
              </Text>
            </Alert>
          )}

          <Group justify="space-between" mt="md">
            <Button
              variant="outline"
              color="var(--custom-theme-heading)"
              leftSection={<IconTestPipe size={18} />}
              onClick={handleSendTest}
              loading={testLoading}
            >
              Send Test Email
            </Button>
            <Group gap="sm">
              <Button
                variant="outline"
                color="gray"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                color="var(--custom-theme-heading)"
                leftSection={<IconSend size={18} />}
                onClick={handleSendToAll}
                loading={loading}
                disabled={guestCount === 0}
              >
                Send to All Guests
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        <Card
          shadow="md"
          radius="md"
          withBorder
          p="xl"
          bg="white"
          style={{ border: '2px solid var(--custom-theme-heading)', cursor: 'pointer' }}
          onClick={open}
        >
          <Stack align="center" gap="md">
            <IconMail size={48} color="var(--custom-theme-heading)" />
            <Text fz="lg" fw={600} ff="heading" c="var(--custom-theme-heading)" ta="center">
              Email All Guests
            </Text>
            <Group gap="xs">
              <IconUsers size={18} color="var(--custom-theme-text)" />
              <Text size="sm" c="var(--custom-theme-text)" ff="text">
                {guestCount} guest{guestCount !== 1 ? 's' : ''} with email
              </Text>
            </Group>
            <Button
              fullWidth
              color="var(--custom-theme-heading)"
              leftSection={<IconSend size={18} />}
              mt="sm"
            >
              Compose Email
            </Button>
          </Stack>
        </Card>
      </SimpleGrid>
    </>
  );
}
