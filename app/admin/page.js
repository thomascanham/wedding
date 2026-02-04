import { Paper, Title, Group } from "@mantine/core";
import RouteCards from "@/components/admin/dashboard/RouteCards";
import daysUntilWedding from "@/lib/daysUntil";
import { fetchAllGuests } from "@/actions/guestActions";
import { fetchAllInvites } from "@/actions/inviteActions";

export default async function AdminDashboard() {
  const daysLeft = daysUntilWedding();
  const guestData = await fetchAllGuests();
  const inviteData = await fetchAllInvites();
  const guestCount = guestData.total || 0;
  const inviteCount = inviteData.total || 0;

  return (
    <Paper py="xl" bg="transparent">
      <Group justify="space-between" align="center">
        <Title c="var(--custom-theme-heading)" ff="heading">Admin Dashboard</Title>
        <Title order={4} c="var(--custom-theme-heading)" ff="heading">{daysLeft} days to go</Title>
      </Group>

      <RouteCards guestCount={guestCount} inviteCount={inviteCount} />
    </Paper>
  )
}