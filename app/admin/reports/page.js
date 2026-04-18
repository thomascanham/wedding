import { Paper, Title, SimpleGrid, Card, Text, Group, ThemeIcon, Stack, RingProgress } from "@mantine/core";
import { IconCake, IconToolsKitchen2 } from "@tabler/icons-react";
import { fetchAllGuests } from "@/actions/guestActions";

export const dynamic = 'force-dynamic';

const DESSERTS = [
  { key: 'cheesecake', label: 'Baked Vanilla Cheesecake with Raspberry Coulis', color: 'var(--custom-theme-heading)' },
  { key: 'sticky_toffee', label: 'Sticky Toffee Pudding with Custard', color: 'var(--mantine-color-orange-7)' },
];

const EVENING_MEALS = [
  { key: 'Hog Roast', label: 'Hog Roast', color: 'var(--mantine-color-red-8)' },
  { key: 'Vegetarian / Vegan', label: 'Vegetarian / Vegan', color: 'var(--mantine-color-green-7)' },
];

export default async function AdminReports() {
  const { data: guests } = await fetchAllGuests();

  const allGuests = Array.isArray(guests) ? guests : [];

  const dessertGuests = allGuests.filter(g => g.dessert);
  const dessertTotal = dessertGuests.length;
  const dessertCounts = DESSERTS.map(d => ({
    ...d,
    count: dessertGuests.filter(g => g.dessert === d.key).length,
  }));

  const eveningMealGuests = allGuests.filter(g => g.eveningMeal);
  const eveningMealTotal = eveningMealGuests.length;
  const eveningMealCounts = EVENING_MEALS.map(m => ({
    ...m,
    count: eveningMealGuests.filter(g => g.eveningMeal === m.key).length,
  }));

  return (
    <Paper py="xl" bg="transparent">
      <Title c="var(--custom-theme-heading)" ff="heading" mb="xl">Reports</Title>

      <Stack gap="xs" mb="xl">
        <Group gap="xs" align="center">
          <IconCake size={15} color="var(--custom-theme-heading)" />
          <Text fz="sm" fw={700} ff="heading" c="var(--custom-theme-heading)">Desserts</Text>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {dessertCounts.map(d => {
            const percent = dessertTotal > 0 ? Math.round((d.count / dessertTotal) * 100) : 0;
            return (
              <Card key={d.key} withBorder shadow="sm" radius="md" p="lg" style={{ borderColor: 'var(--custom-theme-fill)' }}>
                <Group justify="space-between" align="flex-start" mb="xs">
                  <Text fz="sm" fw={500} c="dimmed" ff="text">{d.label}</Text>
                  <ThemeIcon variant="light" size="md" radius="md" style={{ backgroundColor: `color-mix(in srgb, ${d.color} 12%, transparent)`, color: d.color }}>
                    <IconCake size={16} />
                  </ThemeIcon>
                </Group>
                <Group align="center" gap="md">
                  <RingProgress
                    size={72}
                    thickness={7}
                    roundCaps
                    sections={[{ value: percent, color: d.color }]}
                    label={
                      <Text fz="xs" fw={700} ta="center" style={{ color: d.color }}>
                        {percent}%
                      </Text>
                    }
                  />
                  <Stack gap={2}>
                    <Text fz={36} fw={700} ff="heading" lh={1} style={{ color: d.color }}>
                      {d.count}
                    </Text>
                    <Text fz="xs" c="dimmed" ff="text">of {dessertTotal} choices</Text>
                  </Stack>
                </Group>
              </Card>
            );
          })}
        </SimpleGrid>
      </Stack>

      <Stack gap="xs" mb="xl">
        <Group gap="xs" align="center">
          <IconToolsKitchen2 size={15} color="var(--custom-theme-heading)" />
          <Text fz="sm" fw={700} ff="heading" c="var(--custom-theme-heading)">Evening Food</Text>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {eveningMealCounts.map(m => {
            const percent = eveningMealTotal > 0 ? Math.round((m.count / eveningMealTotal) * 100) : 0;
            return (
              <Card key={m.key} withBorder shadow="sm" radius="md" p="lg" style={{ borderColor: 'var(--custom-theme-fill)' }}>
                <Group justify="space-between" align="flex-start" mb="xs">
                  <Text fz="sm" fw={500} c="dimmed" ff="text">{m.label}</Text>
                  <ThemeIcon variant="light" size="md" radius="md" style={{ backgroundColor: `color-mix(in srgb, ${m.color} 12%, transparent)`, color: m.color }}>
                    <IconToolsKitchen2 size={16} />
                  </ThemeIcon>
                </Group>
                <Group align="center" gap="md">
                  <RingProgress
                    size={72}
                    thickness={7}
                    roundCaps
                    sections={[{ value: percent, color: m.color }]}
                    label={
                      <Text fz="xs" fw={700} ta="center" style={{ color: m.color }}>
                        {percent}%
                      </Text>
                    }
                  />
                  <Stack gap={2}>
                    <Text fz={36} fw={700} ff="heading" lh={1} style={{ color: m.color }}>
                      {m.count}
                    </Text>
                    <Text fz="xs" c="dimmed" ff="text">of {eveningMealTotal} choices</Text>
                  </Stack>
                </Group>
              </Card>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}
