import { Paper, Title, Group } from "@mantine/core";
import { fetchAllRooms } from "@/actions/roomActions";
import { fetchAllGuests } from "@/actions/guestActions";
import RoomManager from "@/components/admin/rooms/RoomManager";

export const dynamic = 'force-dynamic';

export default async function AdminRooms() {
  const roomsData = await fetchAllRooms();
  const guestsData = await fetchAllGuests();

  return (
    <Paper py="xl" bg="transparent">
      <Group justify="space-between" align="center" mb="md">
        <Title c="var(--custom-theme-heading)" ff="heading">Rooms</Title>
      </Group>
      <RoomManager roomsData={roomsData} guestsData={guestsData} />
    </Paper>
  )
}
