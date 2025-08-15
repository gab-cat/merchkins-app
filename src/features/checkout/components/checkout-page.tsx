"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery } from 'convex/react'
import { useAuth } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { CreditCard, ListChecks, StickyNote, ShoppingBag } from 'lucide-react'
import type { Id } from '@/convex/_generated/dataModel'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { showToast, promiseToast } from '@/lib/toast'

export function CheckoutPage () {
  const { userId: clerkId } = useAuth()
  const cart = useQuery(api.carts.queries.index.getCartByUser, {})
  const createOrder = useMutation(api.orders.mutations.index.createOrder)
  const me = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : 'skip')

  const [notes, setNotes] = useState('')
  const [isPlacing, setIsPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedItems = useMemo(() => {
    const items = cart?.embeddedItems ?? []
    return items.filter((i) => i.selected && i.quantity > 0)
  }, [cart])

  const selectedByOrg = useMemo(() => {
    type Line = typeof selectedItems[number] & { productInfo: { organizationId?: string; organizationName?: string } }
    const groups: Record<string, { name: string; items: Array<Line> }> = {}
    for (const raw of selectedItems as Array<Line>) {
      const orgId = String(raw.productInfo.organizationId ?? 'global')
      const orgName = raw.productInfo.organizationName ?? 'Storefront'
      if (!groups[orgId]) groups[orgId] = { name: orgName, items: [] }
      groups[orgId].items.push(raw)
    }
    return groups
  }, [selectedItems])

  const totals = useMemo(() => {
    return {
      quantity: selectedItems.reduce((s, i) => s + i.quantity, 0),
      amount: selectedItems.reduce((s, i) => s + i.quantity * i.productInfo.price, 0),
    }
  }, [selectedItems])

  const canCheckout = !!cart && selectedItems.length > 0 && !!me

  async function handlePlaceOrder () {
    if (!canCheckout || !me) return
    setIsPlacing(true)
    setError(null)
    try {
      // Create one order per organization group
      const promises: Array<Promise<unknown>> = []
      for (const [orgId, group] of Object.entries(selectedByOrg)) {
        const items = group.items.map((it) => ({
          productId: it.productInfo.productId,
          variantId: 'variantId' in it ? (it as { variantId?: string }).variantId : undefined,
          quantity: it.quantity,
          price: it.productInfo.price,
          customerNote: it.note,
        }))
        const orgIdArg = orgId !== 'global' ? (orgId as unknown as Id<'organizations'>) : undefined
        promises.push(
          createOrder({
            customerId: me._id,
            organizationId: orgIdArg,
            items,
            customerNotes: notes || undefined,
          })
        )
      }

      await promiseToast(
        Promise.all(promises),
        { loading: 'Placing order…', success: 'Order placed', error: () => 'Failed to place order' },
      )
      window.location.href = '/orders'
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to place order'
      setError(message)
      showToast({ type: 'error', title: message })
    } finally {
      setIsPlacing(false)
    }
  }

  if (cart === undefined || me === undefined) {
    return (
      <div className="container mx-auto px-3 py-8">
        <div className="grid gap-4">
          {new Array(2).fill(null).map((_, i) => (
            <Card key={`s-${i}`}>
              <CardContent className="p-4">
                <div className="h-6 w-1/3 rounded bg-secondary animate-pulse" />
                <div className="mt-2 h-16 w-full rounded bg-secondary animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!canCheckout) {
    return (
      <div className="container mx-auto px-3 py-16 text-center">
        <h1 className="text-2xl font-semibold">Nothing to checkout</h1>
        <p className="mt-2 text-muted-foreground">Select at least one item in your cart.</p>
        <div className="mt-6">
          <Link href="/cart">
            <Button>Back to cart</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 py-6">
      <h1 className="text-2xl font-semibold inline-flex items-center gap-2"><ShoppingBag className="h-5 w-5" /> Checkout</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="font-medium inline-flex items-center gap-2"><ListChecks className="h-4 w-4" /> Review items</div>
              <div className="mt-3 space-y-5">
                {Object.entries(selectedByOrg).map(([orgId, group]) => (
                  <div key={orgId} className="space-y-2">
                    <div className="text-sm font-semibold text-muted-foreground">{group.name}</div>
                    <div className="space-y-3">
                      {group.items.map((it) => (
                        <div key={`${String(it.productInfo.productId)}::${it.productInfo.variantName ?? 'default'}`} className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">
                              {it.productInfo.title}
                              {it.productInfo.variantName ? (
                                <span className="ml-2 text-sm text-muted-foreground">{it.productInfo.variantName}</span>
                              ) : null}
                            </div>
                            <div className="text-sm text-muted-foreground">Qty {it.quantity} × ${it.productInfo.price.toFixed(2)}</div>
                          </div>
                          <div className="font-semibold">${(it.quantity * it.productInfo.price).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="font-medium inline-flex items-center gap-2"><StickyNote className="h-4 w-4" /> Notes</div>
              <Input
                placeholder="Add order notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Items</span>
                <span>{totals.quantity}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>${totals.amount.toFixed(2)}</span>
              </div>
              {error ? (
                <div className="text-sm text-red-600">{error}</div>
              ) : null}
              <Button className="mt-3 w-full" onClick={handlePlaceOrder} disabled={isPlacing} aria-label="Place order">
                {isPlacing ? 'Placing order…' : (<><CreditCard className="mr-2 h-4 w-4" /> Place order</>)}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


