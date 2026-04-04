import { Paper, Title, Group, Divider } from "@mantine/core";
import RouteCards from "@/components/admin/dashboard/RouteCards";
import StatCards from "@/components/admin/dashboard/StatCards";
import RecentRsvps from "@/components/admin/dashboard/RecentRsvps";
import daysUntilWedding from "@/lib/daysUntil";
import { fetchAllGuests } from "@/actions/guestActions";
import { fetchAllInvites } from "@/actions/inviteActions";
import { fetchAllRooms } from "@/actions/roomActions";

export default async function AdminDashboard() {
  const daysLeft = daysUntilWedding();
  const guestData = await fetchAllGuests();
  const inviteData = await fetchAllInvites();
  const roomData = await fetchAllRooms();
  const guestCount = guestData.total || 0;
  const inviteCount = inviteData.total || 0;
  const roomCount = roomData.total || 0;
  const guests = guestData.data || [];
  const rsvpCount = guests.filter(g => g.hasCheckedIn).length;
  const rsvpPercent = guestCount > 0 ? Math.round((rsvpCount / guestCount) * 100) : 0;
  const attendingCount = guests.filter(g => g.rsvpStatus === 'attending').length;
  const declinedCount = guests.filter(g => g.rsvpStatus === 'declined').length;
  const awaitingCount = guests.filter(g => !g.hasCheckedIn).length;

  const ceremonyGuests = guests.filter(g => g.attendanceType === 'ceremony');
  const receptionGuests = guests.filter(g => g.attendanceType === 'reception');

  const ceremonyStats = {
    total: ceremonyGuests.length,
    attending: ceremonyGuests.filter(g => g.rsvpStatus === 'attending').length,
    declined: ceremonyGuests.filter(g => g.rsvpStatus === 'declined').length,
    awaiting: ceremonyGuests.filter(g => !g.hasCheckedIn).length,
    hoopMade: ceremonyGuests.filter(g => g.hoop).length,
    hoopNeeded: ceremonyGuests.filter(g => !g.hoop).length,
  };

  const receptionStats = {
    total: receptionGuests.length,
    attending: receptionGuests.filter(g => g.rsvpStatus === 'attending').length,
    declined: receptionGuests.filter(g => g.rsvpStatus === 'declined').length,
    awaiting: receptionGuests.filter(g => !g.hasCheckedIn).length,
  };
  const recentRsvps = guests
    .filter(g => g.hasCheckedIn)
    .sort((a, b) => new Date(b.updated) - new Date(a.updated))
    .slice(0, 5);

  return (
    <Paper py="xl" bg="transparent">
      <Group justify="space-between" align="center" mb="xl">
        <Title c="var(--custom-theme-heading)" ff="heading">Dashboard</Title>
        <Title order={4} c="var(--custom-theme-heading)" ff="heading">{daysLeft} days to go</Title>
      </Group>

      <StatCards
        guestCount={guestCount}
        rsvpCount={rsvpCount}
        rsvpPercent={rsvpPercent}
        attendingCount={attendingCount}
        declinedCount={declinedCount}
        awaitingCount={awaitingCount}
        ceremonyStats={ceremonyStats}
        receptionStats={receptionStats}
      />

      <RecentRsvps guests={recentRsvps} />

      <Divider my="xl" color="var(--custom-theme-fill)" />

      <RouteCards guestCount={guestCount} inviteCount={inviteCount} roomCount={roomCount} />
    </Paper>
  )
}