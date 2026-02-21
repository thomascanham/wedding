import Link from "next/link";
import { SimpleGrid, Title, Card, Avatar, Center, Text, Badge, Stack } from "@mantine/core";
import { IconUser, IconMail, IconHotelService } from "@tabler/icons-react";

const data = [
  {
    title: 'Manage Guests',
    description: 'Add, edit, and remove wedding guests.',
    icon: IconUser,
    link: '/admin/guests',
    countKey: 'guestCount',
    countLabel: 'guests'
  },
  {
    title: 'Manage Invites',
    description: 'Add, edit, and remove wedding invites.',
    icon: IconMail,
    link: '/admin/invites',
    countKey: 'inviteCount',
    countLabel: 'invites'
  },
  {
    title: 'Manage Seating',
    description: 'Manage seating for the wedding breakfast',
    icon: IconHotelService,
    link: '/admin/seating',
    countKey: 'seatingCount',
    countLabel: 'seating'
  },
  {
    title: 'Manage Rooms',
    description: 'Manage hotel room blocks for guests.',
    icon: IconHotelService,
    link: '/admin/rooms',
    countKey: 'roomCount',
    countLabel: 'rooms'
  },
]

export default function RouteCards({ guestCount, inviteCount, roomCount }) {
  const counts = { guestCount, inviteCount, roomCount };

  return (
    <SimpleGrid
      py="xl"
      cols={{ base: 1, sm: 2, md: 3 }}
      spacing={{ base: 10, md: 'xl' }}
      verticalSpacing={{ base: 'md', sm: 'xl' }}
    >
      {data.map((item) => (
        <CardLink
          key={item.title}
          data={item}
          count={item.countKey ? counts[item.countKey] : null}
        />
      ))}
    </SimpleGrid>
  )
}

function CardLink({ data, count }) {
  return (
    <Link href={data.link} style={{ display: 'block', height: '100%' }}>
      <Card ta="center" shadow="sm" withBorder py="xl" radius="md" h="100%" style={{ border: '2px solid var(--custom-theme-heading)' }}>
        <Center>
          <Stack align="center" gap={8}>
            <Avatar variant="transparent" radius="xl" size="lg" color="#721F14">
              <data.icon size="lg" />
            </Avatar>
            <Badge
              variant="outline"
              color="var(--custom-theme-heading)"
              size="md"
              ff="text"
              style={{ visibility: count !== null ? 'visible' : 'hidden' }}
              styles={{
                root: {
                  borderWidth: 1.5,
                },
                label: {
                  fontWeight: 600,
                },
              }}
            >
              {count !== null ? `${count} ${data.countLabel}` : 'placeholder'}
            </Badge>
          </Stack>
        </Center>
        <Title pt="md" order={3} size="h3" c="var(--custom-theme-heading)">{data.title}</Title>
        <Text c="dimmed" fz={14} py="md">{data.description}</Text>
      </Card>
    </Link>
  )
}