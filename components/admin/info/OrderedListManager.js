'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Paper, Text, Group, Stack, Button, Modal, TextInput, ActionIcon, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconPencil, IconTrash, IconArrowUp, IconArrowDown } from '@tabler/icons-react';

export default function OrderedListManager({
  title,
  icon,
  note,
  initialData,
  createAction,
  updateAction,
  moveAction,
  deleteAction,
  itemLabel = 'Name',
  itemPlaceholder = 'e.g., John Smith',
  emptyText = 'Nothing added yet.',
}) {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const entries = Array.isArray(initialData) ? initialData : [];

  const labelStyles = {
    label: {
      color: 'var(--custom-theme-text)',
      fontFamily: 'var(--mantine-font-family)',
    },
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setError(null);
    open();
  };

  const handleOpenEdit = (entry) => {
    setEditingId(entry.id);
    setName(entry.name || '');
    setError(null);
    open();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError(`Please enter a ${itemLabel.toLowerCase()}`);
      return;
    }

    setLoading(true);
    setError(null);

    const result = editingId
      ? await updateAction(editingId, name.trim())
      : await createAction(name.trim());

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    close();
    router.refresh();
  };

  const handleMove = async (id, direction) => {
    await moveAction(id, direction);
    router.refresh();
  };

  const handleDelete = async (id) => {
    await deleteAction(id);
    router.refresh();
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title={<Text fw={700} size="lg" c="var(--custom-theme-heading)" ff="heading">{editingId ? `Edit ${itemLabel}` : `Add ${itemLabel}`}</Text>}
        centered
        styles={{
          content: { backgroundColor: 'var(--custom-theme-fill)' },
          header: {
            backgroundColor: 'var(--custom-theme-fill)',
            borderBottom: '2px solid var(--custom-theme-heading)',
            paddingBottom: 'var(--mantine-spacing-md)',
          },
        }}
      >
        <Stack gap="md" pt="md">
          <TextInput
            label={itemLabel}
            placeholder={itemPlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            styles={labelStyles}
          />

          {error && <Text size="sm" c="red" ff="text">{error}</Text>}

          <Button
            color="var(--custom-theme-heading)"
            onClick={handleSave}
            loading={loading}
            fullWidth
            mt="md"
          >
            Save
          </Button>
        </Stack>
      </Modal>

      <Paper
        withBorder
        radius="md"
        p={0}
        style={{ borderColor: 'var(--custom-theme-fill)', overflow: 'hidden' }}
      >
        <Stack
          gap={4}
          px="lg"
          py="md"
          style={{ borderBottom: '1px solid var(--custom-theme-fill)', background: '#faf7f3' }}
        >
          <Group justify="space-between">
            <Group gap="xs" align="center">
              {icon}
              <Text fz="sm" fw={700} ff="heading" c="var(--custom-theme-heading)">{title}</Text>
            </Group>
            <Tooltip label={`Add ${itemLabel}`}>
              <ActionIcon variant="subtle" color="var(--custom-theme-heading)" onClick={handleOpenAdd} aria-label={`Add ${itemLabel}`}>
                <IconPlus size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
          {note && <Text size="xs" c="dimmed" ff="text" fs="italic">{note}</Text>}
        </Stack>

        {entries.length === 0 ? (
          <Text size="sm" c="dimmed" ff="text" fs="italic" px="lg" py="md">{emptyText}</Text>
        ) : (
          entries.map((entry, i) => (
            <Group
              key={entry.id}
              justify="space-between"
              px="lg"
              py="sm"
              style={{ borderBottom: i < entries.length - 1 ? '1px solid var(--custom-theme-fill)' : 'none' }}
            >
              <Group gap="sm">
                <Text size="sm" fw={700} c="var(--custom-theme-heading)" ff="heading" miw={20}>{i + 1}</Text>
                <Text size="sm" fw={500} c="var(--custom-theme-text)" ff="text">{entry.name}</Text>
              </Group>
              <Group gap="xs">
                <ActionIcon
                  variant="subtle"
                  color="var(--custom-theme-heading)"
                  onClick={() => handleMove(entry.id, 'up')}
                  disabled={i === 0}
                  aria-label={`Move ${entry.name} up`}
                >
                  <IconArrowUp size={16} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="var(--custom-theme-heading)"
                  onClick={() => handleMove(entry.id, 'down')}
                  disabled={i === entries.length - 1}
                  aria-label={`Move ${entry.name} down`}
                >
                  <IconArrowDown size={16} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="var(--custom-theme-heading)" onClick={() => handleOpenEdit(entry)} aria-label={`Edit ${entry.name}`}>
                  <IconPencil size={16} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(entry.id)} aria-label={`Remove ${entry.name}`}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Group>
          ))
        )}
      </Paper>
    </>
  );
}
