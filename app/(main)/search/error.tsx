'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // TODO: replace with dynamic value: send to monitoring service
    console.error('Search page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-24" data-testid="search-error-boundary">
      <div className="mx-auto max-w-xl rounded-lg border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">We couldn’t complete your search. Please try again.</p>
        <div className="mt-6">
          <Button onClick={() => reset()} data-testid="search-error-reset">
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
