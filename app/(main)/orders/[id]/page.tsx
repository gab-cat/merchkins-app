import React from 'react'
import type { Metadata } from 'next'
import { OrderDetail } from '@/src/features/orders/components/order-detail'

interface Params {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Order Detail — Merchkins Storefront',
  description: 'View order details.',
}

export default async function Page ({ params }: Params) {
  const { id } = await params
  return (
    <div className="container mx-auto px-3 py-6">
      <OrderDetail orderId={id} />
    </div>
  )
}

