import Link from "next/link";
import { SimpleGrid, Title, Card, Avatar, Center, Text } from "@mantine/core";
import { IconUser, IconMail, IconHotelService } from "@tabler/icons-react";

const data = [
  {
    title: 'Manage Guests',
    description: 'Add, edit, and remove wedding guests.',
    icon: IconUser,
    link: '/admin/guests'
  },
  {
    title: 'Manage Invites',
    description: 'Add, edit, and remove wedding invites.',
    icon: IconMail,
    link: '/admin/invites'
  },
  {
    title: 'Manage Rooms',
    description: 'Manage hotel room blocks for guests.',
    icon: IconHotelService,
    link: '/admin/rooms'
  },
]

const cards = data.map((item) => <CardLink key={item.title} data={item} />)

export default function RouteCards() {
  return (
    <SimpleGrid
      py="xl"
      cols={{ base: 1, sm: 2, md: 3 }}
      spacing={{ base: 10, md: 'xl' }}
      verticalSpacing={{ base: 'md', sm: 'xl' }}
    >
      {cards}
    </SimpleGrid>
  )
}

function CardLink({ data }) {
  return (
    <Link href={data.link}>
      <Card ta="center" shadow="sm" withBorder py="xl" radius="md" style={{ border: '2px solid var(--custom-theme-heading)' }}>
        <Center>
          <Avatar variant="transparent" radius="xl" size="lg" color="#721F14">
            <data.icon size="lg" />
          </Avatar>
        </Center>
        <Title pt="xl" order={3} size="h3" c="var(--custom-theme-heading)">{data.title}</Title>
        <Text c="dimmed" fz={14} py="md">{data.description}</Text>
      </Card>
    </Link>
  )
}