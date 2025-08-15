"use client"

import React from 'react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error ({ reset }: ErrorProps) {

  return (
    <div className="container mx-auto px-4 py-24" data-testid="category-error-boundary">
      <div className="mx-auto max-w-xl rounded-lg border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn’t load this category right now. Please try again.
        </p>
        <div className="mt-6">
          <Button onClick={() => reset()} data-testid="category-error-reset">Try again</Button>
        </div>
      </div>
    </div>
  )
}


