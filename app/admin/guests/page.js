import { Paper, Title, Group } from "@mantine/core";
import { fetchAllGuests } from "@/actions/guestActions";
import { fetchAllInvites } from "@/actions/inviteActions";
import GuestFilters from "@/components/admin/guests/GuestFilters";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [data, invitesData] = await Promise.all([fetchAllGuests(), fetchAllInvites()]);

  const assignedGuestIds = (invitesData.data || []).flatMap((inv) => inv.guest || []);

  return (
    <Paper py="xl" bg="transparent">
      <Group justify="space-between" align="center" mb="md">
        <Title c="var(--custom-theme-heading)" ff="heading">Guests</Title>
      </Group>
      <GuestFilters data={data} assignedGuestIds={assignedGuestIds} />
    </Paper>
  )
}