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
      const promises: Array<Promise<{ orderId: Id<'orders'>; orderNumber: string | undefined; xenditInvoiceUrl: string | undefined; xenditInvoiceId: string | undefined; totalAmount: number }>> = []
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

      const results = await promiseToast(
        Promise.all(promises),
        { loading: 'Placing order…', success: 'Order placed, redirecting to payment...', error: () => 'Failed to place order' },
      )

      // Check if any order has a Xendit invoice URL
      let xenditUrl: string | null = null
      for (const result of results) {
        if (result && typeof result === 'object' && 'xenditInvoiceUrl' in result && result.xenditInvoiceUrl) {
          xenditUrl = result.xenditInvoiceUrl
          break
        }
      }

      if (xenditUrl) {
        // Redirect to Xendit payment page
        window.location.href = xenditUrl
      } else {
        // Fallback to orders page if no payment URL
        window.location.href = '/orders'
      }
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
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-4">
          {new Array(2).fill(null).map((_, i) => (
            <Card key={`s-${i}`} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-5 w-1/3 rounded bg-secondary" />
                <div className="mt-3 h-12 w-full rounded bg-secondary" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!canCheckout) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Nothing to checkout</h1>
        <p className="text-muted-foreground mb-6">Select at least one item in your cart.</p>
        <Link href="/cart">
          <Button className="hover:scale-105 transition-all duration-200">Back to cart</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold inline-flex items-center gap-3"><ShoppingBag className="h-6 w-6" /> Checkout</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="font-semibold inline-flex items-center gap-2 mb-4"><ListChecks className="h-4 w-4" /> Review items</div>
              <div className="space-y-4">
                {Object.entries(selectedByOrg).map(([orgId, group]) => (
                  <div key={orgId} className="space-y-3">
                    <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
                      {group.name}
                    </div>
                    {group.items.map((it) => (
                      <div key={`${String(it.productInfo.productId)}::${it.productInfo.variantName ?? 'default'}`} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            {it.productInfo.title}
                            {it.productInfo.variantName && (
                              <span className="ml-2 text-xs text-muted-foreground font-normal">{it.productInfo.variantName}</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Qty {it.quantity} × ${it.productInfo.price.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-sm font-bold">${(it.quantity * it.productInfo.price).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="font-semibold inline-flex items-center gap-2 mb-3"><StickyNote className="h-4 w-4" /> Order notes</div>
              <Input
                placeholder="Add order notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-9"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Items ({totals.quantity})</span>
                  <span>${totals.amount.toFixed(2)}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${totals.amount.toFixed(2)}</span>
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                    {error}
                  </div>
                )}

                <Button
                  className="w-full h-10 hover:scale-105 transition-all duration-200"
                  onClick={handlePlaceOrder}
                  disabled={isPlacing}
                  aria-label="Place order"
                >
                  {isPlacing ? (
                    'Placing order…'
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" /> Place order
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


