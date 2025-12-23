import type { Metadata } from 'next';
import { AcceptInvitePage } from '@/src/features/organizations/components/accept-invite';

export const metadata: Metadata = {
  title: 'Accept Invitation — Merchkins',
  description: 'Accept your invitation to join an organization on Merchkins.',
};

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <AcceptInvitePage code={code} />;
}
