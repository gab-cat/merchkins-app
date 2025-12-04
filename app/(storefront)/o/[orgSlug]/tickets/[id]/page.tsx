import React from 'react';
import type { Metadata } from 'next';
import { TicketDetail } from '@/src/features/tickets/components/ticket-detail';

interface Params {
  params: Promise<{ orgSlug: string; id: string }>;
}

export const metadata: Metadata = {
  title: 'Ticket Detail — Support',
  description: 'View your support ticket details.',
};

export default async function Page({ params }: Params) {
  const { orgSlug, id } = await params;
  return <TicketDetail ticketId={id} backUrl={`/o/${orgSlug}/tickets`} />;
}
