import { Paper, Title, Group, Alert } from "@mantine/core";
import { fetchAllGuests } from "@/actions/guestActions";
import GuestGrid from "@/components/admin/layout/GuestGrid";

export default async function AdminDashboard() {
  const data = await fetchAllGuests();

  return (
    <Paper py="xl" bg="transparent">
      <Group justify="space-between" align="center">
        <Title c="var(--custom-theme-heading)" ff="heading">Guest Dashboard</Title>
      </Group>
      <GuestGrid data={data} />
    </Paper>
  )
}