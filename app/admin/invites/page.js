import { Paper, Title, Group } from "@mantine/core";
import { fetchAllInvites } from "@/actions/inviteActions";
import { fetchAllGuests } from "@/actions/guestActions";
import InviteManager from "@/components/admin/invites/InviteManager";

export default async function InvitesPage() {
  const invitesData = await fetchAllInvites();
  const guestsData = await fetchAllGuests();

  return (
    <Paper py="xl" bg="transparent">
      <Group justify="space-between" align="center" mb="md">
        <Title c="var(--custom-theme-heading)" ff="heading">Invites</Title>
      </Group>
      <InviteManager invitesData={invitesData} guestsData={guestsData} />
    </Paper>
  )
}
