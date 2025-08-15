"use client"

import React from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function AdminAnalyticsPage () {
  const productAnalytics = useQuery(
    api.products.queries.index.getProductAnalytics,
    { timeframe: 'month' }
  )
  const orderAnalytics = useQuery(
    api.orders.queries.index.getOrderAnalytics,
    {}
  )
  const loading = productAnalytics === undefined || orderAnalytics === undefined

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Analytics</h1>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading analytics...</div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">Product analytics</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Stat title="Views" value={String(productAnalytics?.totalViews ?? 0)} />
              <Stat title="Orders" value={String(productAnalytics?.totalOrders ?? 0)} />
              <Stat title="Revenue" value={`$${(productAnalytics?.totalRevenue ?? 0).toFixed(2)}`} />
            </div>
          </section>
          <section>
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">Order analytics</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Stat title="Orders" value={String(orderAnalytics?.orderCount ?? 0)} />
              <Stat title="Revenue" value={`$${(orderAnalytics?.totalRevenue ?? 0).toFixed(2)}`} />
              <Stat title="Statuses" value={String(Object.keys(orderAnalytics?.totalsByStatus ?? {}).length)} />
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function Stat ({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}


