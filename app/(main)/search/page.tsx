import React from 'react'
import type { Metadata } from 'next'
import { SearchResults } from '@/src/features/products/components/search-results'

export const metadata: Metadata = {
  title: 'Search — Merchkins Storefront',
  description: 'Search for products on Merchkins.',
}

export default function Page () {
  return (
    <div className="container mx-auto px-3 py-6">
      <SearchResults />
    </div>
  )
}


