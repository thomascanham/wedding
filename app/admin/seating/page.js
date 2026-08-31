import { Paper, Title, Group } from "@mantine/core";
import { fetchAllGuests } from "@/actions/guestActions";
import { fetchSeatingTables } from "@/actions/seatingActions";
import SeatingTable from "@/components/admin/seating/SeatingTable";

export const dynamic = 'force-dynamic';

export default async function AdminSeating() {
  const { data: guestsRaw } = await fetchAllGuests();
  const guests = Array.isArray(guestsRaw) ? guestsRaw : [];
  const { data: tableNamesRaw } = await fetchSeatingTables();
  const tableNames = Array.isArray(tableNamesRaw) ? tableNamesRaw : [];

  return (
    <Paper py="xl" bg="transparent">
      <Group justify="space-between" align="center" mb="md">
        <Title c="var(--custom-theme-heading)" ff="heading">Seating</Title>
      </Group>
      <SeatingTable guests={guests} tableNames={tableNames} />
    </Paper>
  );
}
