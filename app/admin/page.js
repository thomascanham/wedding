import { Paper, Title, Group } from "@mantine/core";
import RouteCards from "@/components/admin/dashboard/RouteCards";
import daysUntilWedding from "@/lib/daysUntil";

export default function AdminDashboard() {
  const daysLeft = daysUntilWedding();

  return (
    <Paper py="xl" bg="transparent">
      <Group justify="space-between" align="center">
        <Title c="var(--custom-theme-heading)" ff="heading">Admin Dashboard</Title>
        <Title order={4} c="var(--custom-theme-heading)" ff="heading">{daysLeft} days to go</Title>
      </Group>

      <RouteCards />
    </Paper>
  )
}