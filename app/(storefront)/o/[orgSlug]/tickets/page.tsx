import React from 'react';
import { Suspense } from 'react';
import { TicketsPage } from '@/src/features/tickets/components/tickets-page';
import { Skeleton } from '@/components/ui/skeleton';
import { Ticket } from 'lucide-react';

function TicketsLoading() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Ticket className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<TicketsLoading />}>
      <TicketsPage />
    </Suspense>
  );
}
