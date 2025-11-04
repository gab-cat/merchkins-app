import React from 'react';
import { Suspense } from 'react';
import { TicketsPage } from '@/src/features/tickets/components/tickets-page';

export default function Page() {
  return (
    <Suspense fallback={<div className="py-12">Loading...</div>}>
      <TicketsPage />
    </Suspense>
  );
}
