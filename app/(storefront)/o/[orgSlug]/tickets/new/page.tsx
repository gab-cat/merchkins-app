import React from 'react';
import { Suspense } from 'react';
import { NewTicketForm } from '@/src/features/tickets/components/new-ticket-form';

export default function Page() {
  return (
    <Suspense fallback={<div className="py-12">Loading...</div>}>
      <NewTicketForm />
    </Suspense>
  );
}
