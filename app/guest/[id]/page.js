import { notFound, redirect } from 'next/navigation';
import { fetchGuestById } from '@/actions/guestActions';
import RsvpForm from '@/components/guest/RsvpForm';
import RsvpFormReception from '@/components/guest/RsvpFormReception';

export default async function GuestRsvpPage({ params, searchParams }) {
  const { id } = await params;
  const { from } = await searchParams;
  const { data: guest, error } = await fetchGuestById(id);

  if (error || !guest) notFound();

  // Already submitted — send them back to the invite page
  if (guest.hasCheckedIn && from) {
    redirect(`/invite/${from}`);
  }

  if (guest.attendanceType === 'reception') {
    return <RsvpFormReception guest={guest} inviteId={from || null} />;
  }

  return <RsvpForm guest={guest} inviteId={from || null} />;
}
