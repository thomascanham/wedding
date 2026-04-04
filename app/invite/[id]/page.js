import { notFound } from 'next/navigation';
import { fetchInviteById } from '@/actions/inviteActions';
import InviteLanding from '@/components/guest/InviteLanding';

export default async function InvitePage({ params }) {
  const { id } = await params;
  const { data: invite, error } = await fetchInviteById(id);

  if (error || !invite) notFound();

  return <InviteLanding invite={invite} />;
}
