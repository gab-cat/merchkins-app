"use client"

import React, { useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(amount)
  } catch {
    return `₱${amount.toFixed(2)}`
  }
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? new Array(10).fill(null).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <div className="h-4 w-16 animate-pulse rounded bg-secondary" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-20 animate-pulse rounded bg-secondary" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-12 animate-pulse rounded bg-secondary" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-4 w-16 animate-pulse rounded bg-secondary ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              : filtered.map((o) => (
                  <TableRow key={o._id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link href={`/admin/orders/${o._id}`} className="hover:underline">
                        {o.orderNumber ? `#${o.orderNumber}` : 'N/A'}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={o.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(o.orderDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {o.itemCount}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {o.customerInfo?.email || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(o.totalAmount)}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {!loading && filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">No orders found.</div>
      )}
    </div>
  )
}


