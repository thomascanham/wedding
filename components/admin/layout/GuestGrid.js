import { SimpleGrid, Alert } from "@mantine/core";
import { GuestCard } from "../guests/GuestCard";

export default function GuestGrid({ data }) {
  const { data: guests, total, error } = data;

  if (error) {
    return (
      <Alert title="Error Fetching Guests" color="red" variant="filled">
        {error.message}
      </Alert>
    )
  }

  return (
    <SimpleGrid
      py="xl"
      cols={{ base: 1, sm: 2, lg: 3 }}
      spacing={{ base: 10, sm: 'xl' }}
      verticalSpacing={{
        base: 'md', sm: 'xl'
      }}>
      {guests.map((guest) => (
        <GuestCard key={guest.id} guest={guest} />
      ))}
    </SimpleGrid>
  )
}