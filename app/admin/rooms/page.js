import { Paper, Title, Group, Text } from "@mantine/core";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  return (
    <Paper py="xl" bg="transparent">
      <Group justify="space-between" align="center" mb="md">
        <Title c="var(--custom-theme-heading)" ff="heading">Rooms</Title>
      </Group>
      <Text>This page will manage the rooms in the wedding venue.</Text>
    </Paper>
  )
}