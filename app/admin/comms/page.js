import { Group, Paper, Title } from "@mantine/core";
import { fetchGuestsWithEmail } from "@/actions/emailActions";
import CommsManager from "@/components/admin/comms/CommsManager";

export default async function CommsPage() {
  const { data: guestsWithEmail } = await fetchGuestsWithEmail();

  return (
    <Paper py="xl" bg="transparent">
      <Group justify="space-between" align="center" mb="xl">
        <Title c="var(--custom-theme-heading)" ff="heading">Communications</Title>
      </Group>
      <CommsManager guestsWithEmail={guestsWithEmail} />
    </Paper>
  )
}
