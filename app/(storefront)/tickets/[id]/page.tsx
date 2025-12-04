import React from 'react';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { TicketDetail } from '@/src/features/tickets/components/ticket-detail';

interface Params {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Ticket Detail — Support',
  description: 'View your support ticket details.',
};

export default async function Page({ params }: Params) {
  const { id } = await params;

  // Redirect to new ticket page if id is "new"
  if (id === 'new') {
    redirect('/tickets/new');
  }

  return <TicketDetail ticketId={id} backUrl="/tickets" />;
}
