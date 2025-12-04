import React from 'react';
import { Suspense } from 'react';
import { NewTicketForm } from '@/src/features/tickets/components/new-ticket-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Ticket } from 'lucide-react';

function NewTicketLoading() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Ticket className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<NewTicketLoading />}>
      <NewTicketForm />
    </Suspense>
  );
}
