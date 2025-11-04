"use client"

import React, { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ReceivePaymentDialog } from '@/src/features/orders/components/receive-payment-dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Id, Doc } from '@/convex/_generated/dataModel'

type OrderStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED'
type PaymentStatus = 'PENDING' | 'DOWNPAYMENT' | 'PAID' | 'REFUNDED'

type Order = Doc<"orders">
type OrderItem = NonNullable<Order['embeddedItems']>[0]

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

export default function AdminOrderDetailPage () {
  const params = useParams() as { id: string }
  const order = useQuery(api.orders.queries.index.getOrderById, {
    orderId: params.id as Id<'orders'>,
    includeItems: true,
  })
  const updateOrder = useMutation(api.orders.mutations.index.updateOrder)
  const cancelOrder = useMutation(api.orders.mutations.index.cancelOrder)

  const [updating, setUpdating] = useState(false)

  const loading = order === undefined
  const items = useMemo(() => {
    if (!order) return [] as OrderItem[]
    if (order.embeddedItems) return order.embeddedItems as OrderItem[]
    // @ts-expect-error items is present when includeItems is true and not embedded
    return (order.items ?? []) as OrderItem[]
  }, [order])

  async function handleStatus (next: OrderStatus) {
    if (!order) return
    setUpdating(true)
    try {
      await updateOrder({ orderId: order._id, status: next })
    } finally {
      setUpdating(false)
    }
  }

  async function handlePayment (next: PaymentStatus) {
    if (!order) return
    setUpdating(true)
    try {
      await updateOrder({ orderId: order._id, paymentStatus: next })
    } finally {
      setUpdating(false)
    }
  }

  async function handleCancel () {
    if (!order) return
    setUpdating(true)
    try {
      await cancelOrder({ orderId: order._id, reason: 'OTHERS', message: 'Cancelled by admin' })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="py-12">Loading...</div>
  if (order === null) return <div className="py-12">Order not found.</div>

  const statusOptions: OrderStatus[] = ['PENDING', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED']
  const paymentOptions: PaymentStatus[] = ['PENDING', 'DOWNPAYMENT', 'PAID', 'REFUNDED']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {order.orderNumber ? `Order #${order.orderNumber}` : 'Order'}
          </h1>
          <div className="mt-1 text-sm text-muted-foreground">
            Placed on {new Date(order.orderDate).toLocaleString()}
          </div>
        </div>
        <StatusBadge value={order.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Status</span>
            {statusOptions.map((s) => (
              <Button key={s} size="sm" variant={order.status === s ? 'secondary' : 'outline'} disabled={updating} onClick={() => handleStatus(s)}>
                {s}
              </Button>
            ))}
            <Button size="sm" variant="destructive" disabled={updating || order.status === 'CANCELLED'} onClick={handleCancel}>
              Cancel order
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Payment</span>
            {paymentOptions.map((p) => (
              <Button key={p} size="sm" variant={order.paymentStatus === p ? 'secondary' : 'outline'} disabled={updating} onClick={() => handlePayment(p)}>
                {p}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-3">
          {items.map((it, idx) => (
            <Card key={idx}>
              <CardContent className="flex items-center gap-4 p-4">
                <LineItemImage imageKey={it.productInfo?.imageUrl?.[0]} />
                <div className="flex-1">
                  <div className="font-medium">{it.productInfo?.title}</div>
                  <div className="text-sm text-muted-foreground">{it.productInfo?.variantName ?? ''}</div>
                  <div className="text-sm">Qty: {it.quantity}</div>
                </div>
                <div className="text-right font-medium">{formatCurrency(it.price)}</div>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && (
            <div className="text-sm text-muted-foreground">No items.</div>
          )}
        </div>
        <div>
          <div className="rounded-lg border p-4">
            <div className="text-lg font-semibold">Summary</div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between text-sm">
              <span>Items</span>
              <span>{order.itemCount}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span>Discount</span>
              <span>-{formatCurrency(order.discountAmount)}</span>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="mt-2">
              <ReceivePaymentDialog
                orderId={order._id as Id<'orders'>}
                customerId={order.customerId as Id<'users'>}
                organizationId={order.organizationId as Id<'organizations'>}
                defaultAmount={Math.max(0, (order.totalAmount || 0))}
                onCreated={() => { /* rely on Convex live query to refresh */ }}
              />
            </div>
          </div>
          <div className="mt-4 rounded-lg border p-4 text-sm">
            <div className="font-semibold">Customer</div>
            <div className="mt-1 text-muted-foreground">{order.customerInfo?.firstName} {order.customerInfo?.lastName}</div>
            <div className="text-muted-foreground">{order.customerInfo?.email}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LineItemImage ({ imageKey }: { imageKey?: string }) {
  const url = useQuery(api.files.queries.index.getFileUrl, imageKey ? { key: imageKey } : 'skip')
  if (!url) return <div className="h-16 w-16 rounded-md bg-secondary" />
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="Product" className="h-16 w-16 rounded-md object-cover" />
}


