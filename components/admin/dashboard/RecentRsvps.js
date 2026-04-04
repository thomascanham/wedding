import { Card, Text, Group, Badge, Stack, Avatar, Title } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import getGuestInitials from "@/lib/getGuestInitials";

export default function RecentRsvps({ guests }) {
  return (
    <Card withBorder shadow="sm" radius="md" p="lg" mb="xl" style={{ borderColor: 'var(--custom-theme-fill)' }}>
      <Title order={5} c="var(--custom-theme-heading)" ff="heading" mb="md">
        Recent RSVPs
      </Title>

      {guests.length === 0 ? (
        <Text fz="sm" c="dimmed" ff="text">No RSVPs received yet.</Text>
      ) : (
        <Stack gap="sm">
          {guests.map((guest) => (
            <Group key={guest.id} justify="space-between" align="center">
              <Group gap="sm">
                <Avatar color="var(--custom-theme-heading)" radius="xl" size="sm">
                  {getGuestInitials(guest.firstname, guest.surname)}
                </Avatar>
                <div>
                  <Text fz="sm" fw={500} ff="text" c="var(--custom-theme-heading)">{guest.name}</Text>
                  <Text fz="xs" c="dimmed" ff="text">
                    {new Date(guest.updated).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </Text>
                </div>
              </Group>
              <Badge
                color={guest.rsvpStatus === 'attending' ? 'green' : 'red'}
                variant="light"
                size="sm"
                leftSection={guest.rsvpStatus === 'attending'
                  ? <IconCheck size={10} />
                  : <IconX size={10} />
                }
              >
                {guest.rsvpStatus === 'attending' ? 'Attending' : 'Declined'}
              </Badge>
            </Group>
          ))}
        </Stack>
      )}
    </Card>
  );
}
