'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Paper, Text, Group, Stack, Button, Modal, TextInput, Checkbox, Badge, ActionIcon, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPencil } from '@tabler/icons-react';
import { updateWeddingInfo } from '@/actions/infoActions';

function fieldsToValues(fields, initialData) {
  return Object.fromEntries(fields.map((f) => [f.key, f.type === 'checkbox' ? !!initialData?.[f.key] : (initialData?.[f.key] || '')]));
}

export default function InfoSection({ title, icon, note, fields, initialData }) {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [values, setValues] = useState(() => fieldsToValues(fields, initialData));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const labelStyles = {
    label: {
      color: 'var(--custom-theme-text)',
      fontFamily: 'var(--mantine-font-family)',
    },
  };

  const handleOpen = () => {
    setValues(fieldsToValues(fields, initialData));
    setError(null);
    open();
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    const result = await updateWeddingInfo(values);

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    close();
    router.refresh();
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title={<Text fw={700} size="lg" c="var(--custom-theme-heading)" ff="heading">Edit {title}</Text>}
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
          {fields.map((field) => (
            field.type === 'checkbox' ? (
              <Checkbox
                key={field.key}
                label={field.label}
                checked={values[field.key]}
                onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.currentTarget.checked }))}
                color="var(--custom-theme-heading)"
                styles={labelStyles}
              />
            ) : (
              <TextInput
                key={field.key}
                label={field.label}
                placeholder={field.placeholder}
                value={values[field.key]}
                onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                styles={labelStyles}
              />
            )
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
            <Tooltip label={`Edit ${title}`}>
              <ActionIcon variant="subtle" color="var(--custom-theme-heading)" onClick={handleOpen} aria-label={`Edit ${title}`}>
                <IconPencil size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
          {note && <Text size="xs" c="dimmed" ff="text" fs="italic">{note}</Text>}
        </Stack>

        {fields.map((field, i) => (
          <Group
            key={field.key}
            justify="space-between"
            px="lg"
            py="sm"
            style={{ borderBottom: i < fields.length - 1 ? '1px solid var(--custom-theme-fill)' : 'none' }}
          >
            <Text size="sm" c="dimmed" ff="text">{field.label}</Text>
            {field.type === 'checkbox' ? (
              <Badge
                variant="light"
                color={initialData?.[field.key] ? 'green' : 'gray'}
                size="sm"
                radius="sm"
              >
                {initialData?.[field.key] ? 'Yes' : 'No'}
              </Badge>
            ) : initialData?.[field.key] ? (
              <Text size="sm" fw={500} c="var(--custom-theme-text)" ff="text">{initialData[field.key]}</Text>
            ) : (
              <Text size="sm" c="dimmed" ff="text" fs="italic">Not set</Text>
            )}
          </Group>
        ))}
      </Paper>
    </>
  );
}
