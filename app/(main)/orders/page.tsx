import React from 'react'
import type { Metadata } from 'next'
import { OrdersList } from '@/src/features/orders/components/orders-list'

export const metadata: Metadata = {
  title: 'Your Orders — Merchkins Storefront',
  description: 'View your past orders on Merchkins.',
}

export default function Page () {
  return (
    <div className="container mx-auto px-3 py-6">
      <OrdersList />
    </div>
  )
}

