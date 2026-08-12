'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Paper, Text, Group, Stack, Button, Modal, TextInput, ActionIcon, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';

function fieldsToValues(fields, entry) {
  return Object.fromEntries(fields.map((f) => [f.key, entry?.[f.key] || '']));
}

export default function PersonListManager({
  title,
  icon,
  note,
  initialData,
  createAction,
  updateAction,
  deleteAction,
  primaryLabel = 'Name',
  primaryPlaceholder = 'e.g., John Smith',
  fields,
  emptyText = 'Nothing added yet.',
}) {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [values, setValues] = useState(() => fieldsToValues(fields, null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const entries = Array.isArray(initialData) ? initialData : [];
  const gridTemplateColumns = fields.length > 0
    ? `minmax(140px, 1.5fr) repeat(${fields.length}, 1fr) 72px`
    : 'minmax(140px, 1.5fr) 72px';

  const labelStyles = {
    label: {
      color: 'var(--custom-theme-text)',
      fontFamily: 'var(--mantine-font-family)',
    },
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setValues(fieldsToValues(fields, null));
    setError(null);
    open();
  };

  const handleOpenEdit = (entry) => {
    setEditingId(entry.id);
    setName(entry.name || '');
    setValues(fieldsToValues(fields, entry));
    setError(null);
    open();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }

    setLoading(true);
    setError(null);

    const trimmedValues = fields.map((f) => (values[f.key] || '').trim());

    const result = editingId
      ? await updateAction(editingId, name.trim(), ...trimmedValues)
      : await createAction(name.trim(), ...trimmedValues);

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    close();
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
        title={<Text fw={700} size="lg" c="var(--custom-theme-heading)" ff="heading">{editingId ? 'Edit Entry' : 'Add Entry'}</Text>}
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
            label={primaryLabel}
            placeholder={primaryPlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            styles={labelStyles}
          />
          {fields.map((field) => (
            <TextInput
              key={field.key}
              label={field.label}
              placeholder={field.placeholder}
              value={values[field.key]}
              onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
              styles={labelStyles}
            />
          ))}

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
            <Tooltip label="Add">
              <ActionIcon variant="subtle" color="var(--custom-theme-heading)" onClick={handleOpenAdd} aria-label="Add">
                <IconPlus size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
          {note && <Text size="xs" c="dimmed" ff="text" fs="italic">{note}</Text>}
        </Stack>

        {entries.length === 0 ? (
          <Text size="sm" c="dimmed" ff="text" fs="italic" px="lg" py="md">{emptyText}</Text>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns,
                columnGap: 16,
                padding: '0.5rem 1.5rem',
                background: '#faf7f3',
                borderBottom: '1px solid var(--custom-theme-fill)',
              }}
            >
              <Text size="10px" c="dimmed" ff="text" tt="uppercase" fw={600}>{primaryLabel}</Text>
              {fields.map((field) => (
                <Text key={field.key} size="10px" c="dimmed" ff="text" tt="uppercase" fw={600}>{field.label}</Text>
              ))}
              <span />
            </div>

            {entries.map((entry, i) => (
              <div
                key={entry.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns,
                  columnGap: 16,
                  alignItems: 'center',
                  padding: '0.75rem 1.5rem',
                  borderBottom: i < entries.length - 1 ? '1px solid var(--custom-theme-fill)' : 'none',
                }}
              >
                <Text size="sm" fw={500} c="var(--custom-theme-text)" ff="text">{entry.name}</Text>
                {fields.map((field) => (
                  entry[field.key] ? (
                    <Text key={field.key} size="sm" c="var(--custom-theme-text)" ff="text">{entry[field.key]}</Text>
                  ) : (
                    <Text key={field.key} size="sm" c="dimmed" ff="text" fs="italic">Not set</Text>
                  )
                ))}
                <Group gap="xs" justify="flex-end">
                  <ActionIcon variant="subtle" color="var(--custom-theme-heading)" onClick={() => handleOpenEdit(entry)} aria-label={`Edit ${entry.name}`}>
                    <IconPencil size={16} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(entry.id)} aria-label={`Remove ${entry.name}`}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </div>
            ))}
          </>
        )}
      </Paper>
    </>
  );
}
