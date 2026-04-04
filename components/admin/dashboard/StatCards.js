import { SimpleGrid, Card, Text, Group, ThemeIcon, RingProgress, Stack, Badge, Divider } from "@mantine/core";
import { IconUsers, IconCheckbox, IconCheck, IconX, IconClock, IconRings, IconCircleCheck, IconCircleDashed } from "@tabler/icons-react";

export default function StatCards({ guestCount, rsvpCount, rsvpPercent, attendingCount, declinedCount, awaitingCount, ceremonyStats, receptionStats }) {
  return (
    <>
      {/* Overall totals row */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
        <StatCard
          label="Total Guests"
          value={guestCount}
          icon={IconUsers}
          description="Guests added to the system"
          split={[
            { label: 'Ceremony', value: ceremonyStats.total },
            { label: 'Reception', value: receptionStats.total },
          ]}
        />
        <RsvpCard
          rsvpCount={rsvpCount}
          guestCount={guestCount}
          rsvpPercent={rsvpPercent}
        />
      </SimpleGrid>

      {/* Overall RSVP breakdown */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb={48}>
        <StatCard
          label="Attending"
          value={attendingCount}
          icon={IconCheck}
          description="Guests who have accepted"
          valueColor="green.7"
          iconColor="green"
        />
        <StatCard
          label="Declined"
          value={declinedCount}
          icon={IconX}
          description="Guests who have declined"
          valueColor="red.7"
          iconColor="red"
        />
        <StatCard
          label="Awaiting Response"
          value={awaitingCount}
          icon={IconClock}
          description="Yet to submit their RSVP"
          valueColor="orange.7"
          iconColor="orange"
        />
      </SimpleGrid>

      {/* Ceremony vs Reception breakdown */}
      <AttendanceBreakdown label="Ceremony" stats={ceremonyStats} accent="var(--custom-theme-heading)" showHoops mb={48} />
      <AttendanceBreakdown label="Reception Only" stats={receptionStats} accent="var(--mantine-color-violet-7)" mb="xl" />
    </>
  );
}

function AttendanceBreakdown({ label, stats, accent, mb, showHoops }) {
  const percent = stats.total > 0 ? Math.round(((stats.attending + stats.declined) / stats.total) * 100) : 0;
  return (
    <Stack gap="xs" mb={mb || "md"}>
      <Group gap="xs" align="center">
        <IconRings size={15} color={accent} />
        <Text fz="sm" fw={700} ff="heading" style={{ color: accent }}>{label} Guests</Text>
        <Badge variant="light" size="sm" style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent, border: 'none' }}>
          {stats.total} total
        </Badge>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <MiniStatCard label="Attending" value={stats.attending} accent="green" />
        <MiniStatCard label="Declined" value={stats.declined} accent="red" />
        <MiniStatCard label="Awaiting" value={stats.awaiting} accent="orange" extra={`${percent}% responded`} />
      </SimpleGrid>
      {showHoops && (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <MiniStatCard label="Hoops Made" value={stats.hoopMade} accent="teal" icon={IconCircleCheck} />
          <MiniStatCard label="Hoops Still Needed" value={stats.hoopNeeded} accent="yellow" icon={IconCircleDashed} />
        </SimpleGrid>
      )}
    </Stack>
  );
}

function MiniStatCard({ label, value, accent, extra, icon: Icon }) {
  return (
    <Card withBorder shadow="xs" radius="md" p="md" style={{ borderColor: 'var(--custom-theme-fill)' }}>
      <Group justify="space-between" align="center">
        <div>
          <Text fz="xs" c="dimmed" ff="text" mb={2}>{label}</Text>
          <Text fz={26} fw={700} c={`${accent}.7`} ff="heading" lh={1}>{value}</Text>
          {extra && <Text fz="xs" c="dimmed" ff="text" mt={4}>{extra}</Text>}
        </div>
        {Icon && (
          <ThemeIcon variant="light" color={accent} size="lg" radius="md">
            <Icon size={18} />
          </ThemeIcon>
        )}
      </Group>
    </Card>
  );
}

function StatCard({ label, value, icon: Icon, description, valueColor = 'var(--custom-theme-heading)', iconColor = 'var(--custom-theme-heading)', split }) {
  return (
    <Card withBorder shadow="sm" radius="md" p="lg" style={{ borderColor: 'var(--custom-theme-fill)' }}>
      <Group justify="space-between" align="flex-start" mb="xs">
        <Text fz="sm" fw={500} c="dimmed" ff="text">{label}</Text>
        <ThemeIcon variant="light" color={iconColor} size="md" radius="md">
          <Icon size={16} />
        </ThemeIcon>
      </Group>
      <Text fz={36} fw={700} c={valueColor} ff="heading" lh={1}>
        {value ?? '—'}
      </Text>
      <Text fz="xs" c="dimmed" mt={6} ff="text">{description}</Text>
      {split && (
        <>
          <Divider my="sm" color="var(--custom-theme-fill)" />
          <Group gap={0} grow>
            {split.map((item, i) => (
              <div key={item.label} style={{ paddingLeft: i > 0 ? '0.75rem' : 0, borderLeft: i > 0 ? '1px solid var(--custom-theme-fill)' : 'none' }}>
                <Text fz="xs" c="dimmed" ff="text">{item.label}</Text>
                <Text fz="md" fw={700} c={valueColor} ff="heading" lh={1.3}>{item.value}</Text>
              </div>
            ))}
          </Group>
        </>
      )}
    </Card>
  );
}

function RsvpCard({ rsvpCount, guestCount, rsvpPercent }) {
  return (
    <Card withBorder shadow="sm" radius="md" p="lg" style={{ borderColor: 'var(--custom-theme-fill)' }}>
      <Group justify="space-between" align="flex-start" mb="xs">
        <Text fz="sm" fw={500} c="dimmed" ff="text">RSVPs Received</Text>
        <ThemeIcon variant="light" color="var(--custom-theme-heading)" size="md" radius="md">
          <IconCheckbox size={16} />
        </ThemeIcon>
      </Group>
      <Group align="center" gap="md">
        <RingProgress
          size={72}
          thickness={7}
          roundCaps
          sections={[{ value: rsvpPercent, color: 'var(--custom-theme-heading)' }]}
          label={
            <Text fz="xs" fw={700} c="var(--custom-theme-heading)" ta="center">
              {rsvpPercent}%
            </Text>
          }
        />
        <Stack gap={2}>
          <Text fz={28} fw={700} c="var(--custom-theme-heading)" ff="heading" lh={1}>
            {rsvpCount}
          </Text>
          <Text fz="xs" c="dimmed" ff="text">of {guestCount} guests</Text>
        </Stack>
      </Group>
    </Card>
  );
}
