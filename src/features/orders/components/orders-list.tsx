"use client"

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Id } from '@/convex/_generated/dataModel'

function formatCurrency (amount: number | undefined) {
  if (amount === undefined) return ''
  return `$${amount.toFixed(2)}`
}

function StatusBadge ({ value }: { value: string }) {
  const variant: 'default' | 'secondary' | 'destructive' =
    value === 'CANCELLED' ? 'destructive' :
    value === 'PENDING' ? 'secondary' : 'default'
  return <Badge variant={variant}>{value}</Badge>
}

type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED'

type Order = {
  _id: string
  orderNumber?: string
  status: OrderStatus
  orderDate: number
  itemCount: number
  totalAmount?: number
}

function formatDateLabel (ts: number) {
  const d = new Date(ts)
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime (ts: number) {
  const d = new Date(ts)
  return d.toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function OrdersList () {
  const { userId } = useAuth()
  const currentUser = useQuery(
    api.users.queries.index.getCurrentUser,
    userId ? { clerkId: userId } : 'skip',
  )

  const customerId = currentUser?._id

  const [selectedStatus, setSelectedStatus] =
    useState<'ALL' | OrderStatus>('ALL')
  const [offset, setOffset] = useState(0)
  const [limit] = useState(20)
  const [accOrders, setAccOrders] = useState<Order[]>([])

  const ordersResult = useQuery(
    api.orders.queries.index.getOrders,
    customerId
      ? {
          customerId: customerId as Id<'users'>,
          status: selectedStatus === 'ALL' ? undefined : selectedStatus,
          limit,
          offset,
        }
      : 'skip',
  )

  const loading = currentUser === undefined || ordersResult === undefined

  // Reset pagination and accumulated list when user or filter changes
  useEffect(() => {
    setOffset(0)
    setAccOrders([])
  }, [customerId, selectedStatus])

  // Accumulate results across pages, dedupe by _id
  useEffect(() => {
    if (!ordersResult) return
    const incoming = (ordersResult.orders ?? []) as Order[]
    if (offset === 0) {
      setAccOrders(incoming)
      return
    }
    setAccOrders(prev => {
      const seen = new Set(prev.map(o => o._id))
      const merged = [...prev]
      for (const o of incoming) {
        if (!seen.has(o._id)) merged.push(o)
      }
      return merged
    })
  }, [ordersResult, offset])

  const title = useMemo(() => (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold leading-tight">Your orders</h1>
      <p className="text-sm text-muted-foreground">
        View your recent orders and their status.
      </p>
    </div>
  ), [])

  const statusFilters: Array<{ key: 'ALL' | OrderStatus, label: string }> = [
    { key: 'ALL', label: 'All' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'READY', label: 'Ready' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ]

  const grouped = useMemo(() => {
    const map = new Map<string, Order[]>()
    for (const o of accOrders) {
      const key = formatDateLabel(o.orderDate)
      const arr = map.get(key) ?? []
      arr.push(o)
      map.set(key, arr)
    }
    return Array.from(map.entries())
  }, [accOrders])

  if (currentUser === null) {
    return (
      <div>
        {title}
        <div className="text-sm text-muted-foreground">
          No user profile found.
        </div>
      </div>
    )
  }

  return (
    <div>
      {title}
      {/* Status filters */}
      <div className="mb-4 flex flex-wrap gap-2" data-testid="orders-filters">
        {statusFilters.map(f => (
          <Button
            key={f.key}
            variant={selectedStatus === f.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus(f.key)}
            data-testid={`orders-filter-${f.key}`}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* List view grouped by date */}
      <div className="rounded-md border" data-testid="orders-list">
        {loading && accOrders.length === 0 && (
          <div className="p-4 space-y-2">
            <div className="h-5 w-1/3 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-secondary" />
          </div>
        )}

        {!loading && accOrders.length === 0 && (
        <div className="text-sm text-muted-foreground">
          You have no orders yet.
        </div>
      )}

        {grouped.map(([label, list]) => (
          <div key={label}>
            <div className="bg-muted/40 px-3 py-2 text-xs font-medium">
              {label}
            </div>
            <Separator />
            {list.map(o => (
              <Link
                href={`/orders/${o._id}`}
                key={o._id}
                className="block hover:bg-accent/50"
              >
                <div className="px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {o.orderNumber ? `Order #${o.orderNumber}` : 'Order'}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {formatDateTime(o.orderDate)}
                        <span className="mx-2">•</span>
                        {o.itemCount} items
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold">
                        {formatCurrency(o.totalAmount)}
                      </div>
                      <StatusBadge value={o.status} />
                    </div>
                  </div>
                </div>
                <Separator />
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {ordersResult && ordersResult.hasMore && (
        <div className="mt-4 flex justify-center">
          <Button
            onClick={() => setOffset(prev => prev + limit)}
            data-testid="orders-load-more"
            disabled={loading}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}


