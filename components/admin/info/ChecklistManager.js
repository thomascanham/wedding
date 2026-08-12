'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Paper, Text, Group, Stack, Button, Modal, TextInput, ActionIcon, Tooltip, Checkbox } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTrash } from '@tabler/icons-react';

export default function ChecklistManager({
  title,
  icon,
  note,
  initialData,
  createAction,
  toggleAction,
  deleteAction,
  valueKey,
  itemLabel = 'Name',
  itemPlaceholder = '',
  checkboxLabel = 'Done',
  emptyText = 'Nothing added yet.',
}) {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
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

  const handleOpen = () => {
    setName('');
    setError(null);
    open();
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      setError('Please enter a value');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await createAction(name.trim());

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    close();
    router.refresh();
  };

  const handleToggle = async (entry) => {
    await toggleAction(entry.id, entry[valueKey]);
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
        title={<Text fw={700} size="lg" c="var(--custom-theme-heading)" ff="heading">Add {itemLabel}</Text>}
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
            onClick={handleAdd}
            loading={loading}
            fullWidth
            mt="md"
          >
            Add
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
              <ActionIcon variant="subtle" color="var(--custom-theme-heading)" onClick={handleOpen} aria-label={`Add ${itemLabel}`}>
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
              <Text size="sm" fw={500} c="var(--custom-theme-text)" ff="text">{entry.name}</Text>
              <Group gap="md">
                <Checkbox
                  label={checkboxLabel}
                  checked={!!entry[valueKey]}
                  onChange={() => handleToggle(entry)}
                  color="var(--custom-theme-heading)"
                  styles={{ label: { color: 'var(--custom-theme-text)', fontFamily: 'var(--mantine-font-family)', fontSize: 'var(--mantine-font-size-sm)' } }}
                />
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
