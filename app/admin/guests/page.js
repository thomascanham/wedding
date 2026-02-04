import { Paper, Title, Group } from "@mantine/core";
import { fetchAllGuests } from "@/actions/guestActions";
import GuestFilters from "@/components/admin/guests/GuestFilters";

export default async function AdminDashboard() {
  const data = await fetchAllGuests();

  return (
    <Paper py="xl" bg="transparent">
      <Group justify="space-between" align="center" mb="md">
        <Title c="var(--custom-theme-heading)" ff="heading">Guest Dashboard</Title>
      </Group>
      <GuestFilters data={data} />
    </Paper>
  )
}