"use client"

import React, { useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type OrderStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED'
type PaymentStatus = 'PENDING' | 'DOWNPAYMENT' | 'PAID' | 'REFUNDED'

function StatusBadge ({ value }: { value: string }) {
  const variant: 'default' | 'secondary' | 'destructive' =
    value === 'CANCELLED' ? 'destructive' :
    value === 'PENDING' ? 'secondary' : 'default'
  return <Badge variant={variant}>{value}</Badge>
}

function formatCurrency (amount: number | undefined) {
  if (amount === undefined) return ''
  return `$${amount.toFixed(2)}`
}

export default function AdminOrdersPage () {
  const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  const ordersResult = useQuery(api.orders.queries.index.getOrdersPage, {
    status: status === 'ALL' ? undefined : status,
    paymentStatus: paymentStatus === 'ALL' ? undefined : paymentStatus,
    includeDeleted: true,
    limit: 100,
    cursor: undefined,
  }) as unknown as { page?: Array<{ _id: string, orderNumber?: string, status: string, orderDate: number, itemCount: number, totalAmount?: number, customerInfo?: { email?: string } }> }

  const loading = ordersResult === undefined

  const filtered = useMemo(() => {
    const orders = ordersResult?.page ?? []
    if (!search) return orders
    const q = search.toLowerCase()
    return orders.filter((o) =>
      [o.orderNumber || '', o.customerInfo?.email || '']
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  }, [ordersResult?.page, search])

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-sm text-muted-foreground">Manage and process customer orders</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="Search by order # or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <select className="h-9 rounded-md border bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="READY">Ready</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select className="h-9 rounded-md border bg-background px-3 text-sm" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus )}>
            <option value="ALL">All payments</option>
            <option value="PENDING">Pending</option>
            <option value="DOWNPAYMENT">Downpayment</option>
            <option value="PAID">Paid</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <Link href="/admin/orders/new">
            <Button>Create order</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {loading
          ? new Array(6).fill(null).map((_, i) => (
              <Card key={`skeleton-${i}`} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="h-4 w-1/3 animate-pulse rounded bg-secondary" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-4 w-1/5 animate-pulse rounded bg-secondary" />
                  <div className="h-4 w-1/4 animate-pulse rounded bg-secondary" />
                </CardContent>
              </Card>
            ))
          : filtered.map((o) => (
              <Link key={o._id} href={`/admin/orders/${o._id}`}>
                <Card className="h-full transition hover:border-primary">
                  <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
                    <CardTitle className="text-base font-medium">
                      {o.orderNumber ? `Order #${o.orderNumber}` : 'Order'}
                    </CardTitle>
                    <StatusBadge value={o.status} />
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>{new Date(o.orderDate).toLocaleDateString()}</span>
                      <span>{o.itemCount} items</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span>{o.customerInfo?.email}</span>
                      <span className="font-medium text-foreground">{formatCurrency(o.totalAmount)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">No orders found.</div>
      )}
    </div>
  )
}


