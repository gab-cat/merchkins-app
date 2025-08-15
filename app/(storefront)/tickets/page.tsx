import React from 'react'
import { Suspense } from 'react'
import { ConsolidatedTicketsPage } from '@/src/features/tickets/components/consolidated-tickets-page'

export default function Page () {
  return (
    <Suspense fallback={<div className="py-12">Loading...</div>}>
      <ConsolidatedTicketsPage />
    </Suspense>
  )
}


