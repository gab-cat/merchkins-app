"use client"

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { R2Image } from '@/src/components/ui/r2-image'
import { showToast, promiseToast } from '@/lib/toast'
import { Trash2, Plus, Minus } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function CartPage () {
  const cart = useQuery(api.carts.queries.index.getCartByUser, {})
  const clearCart = useMutation(api.carts.mutations.index.clearCart)

  const hasItems = (cart?.embeddedItems?.length ?? 0) > 0

  const totals = useMemo(() => {
    return {
      totalItems: cart?.totalItems ?? 0,
      totalValue: cart?.totalValue ?? 0,
      selectedItems: cart?.selectedItems ?? 0,
      selectedValue: cart?.selectedValue ?? 0,
    }
  }, [cart])

  const groupedByOrg = useMemo(() => {
    const groups: Record<string, { name: string; items: Array<CartItem> }> = {}
    for (const raw of cart?.embeddedItems ?? []) {
      const item = raw as CartItem
      const orgId = String(item.productInfo.organizationId ?? 'global')
      const orgName = item.productInfo.organizationName ?? 'Storefront'
      if (!groups[orgId]) groups[orgId] = { name: orgName, items: [] }
      groups[orgId].items.push(item)
    }
    return groups
  }, [cart])

  async function handleClear () {
    if (!cart) return
    try {
      await promiseToast(
        clearCart({ cartId: cart._id }),
        { loading: 'Clearing cart…', success: 'Cart cleared', error: () => 'Failed to clear cart' },
      )
    } catch {
      // no-op
    }
  }

  if (cart === undefined) {
    return (
      <div className="container mx-auto px-3 py-8">
        <div className="grid gap-4">
          {new Array(3).fill(null).map((_, i) => (
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

  if (!cart || !hasItems) {
    return (
      <div className="container mx-auto px-3 py-16 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Browse products and add items to your cart.</p>
        <div className="mt-6">
          <Link href="/">
            <Button>Continue shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 py-6">
      <h1 className="text-2xl font-semibold">Your cart</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          {Object.entries(groupedByOrg).map(([orgId, group]) => (
            <div key={orgId} className="space-y-2">
              <div className="text-sm font-semibold text-muted-foreground">{group.name}</div>
              {group.items.map((item) => (
                <CartLineItem
                  key={`${String(item.productInfo.productId)}::${item.productInfo.variantName ?? 'default'}`}
                  cartId={cart._id}
                  item={item}
                />
              ))}
            </div>
          ))}

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleClear}>Clear cart</Button>
          </div>
        </div>

        <div className="space-y-3">
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Items</span>
                <span>{totals.totalItems}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>${totals.totalValue.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between font-semibold">
                <span>Selected total</span>
                <span>${totals.selectedValue.toFixed(2)}</span>
              </div>
          <Link href="/checkout">
            <Button className="mt-3 w-full" disabled={totals.selectedItems === 0}>
              Checkout
            </Button>
          </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

type CartItem = {
  variantId?: string
  productInfo: {
    productId: Id<'products'>
    organizationId?: Id<'organizations'>
    organizationName?: string
    title: string
    slug: string
    imageUrl: string[]
    variantName?: string
    price: number
    originalPrice?: number
    inventory: number
  }
  quantity: number
  selected: boolean
  note?: string
  addedAt: number
}

function CartLineItem ({ cartId, item }: { cartId: Id<'carts'>; item: CartItem }) {
  const setSelected = useMutation(api.carts.mutations.index.setItemSelected)
  const updateQty = useMutation(api.carts.mutations.index.updateItemQuantity)
  const setItemNote = useMutation(api.carts.mutations.index.setItemNote)
  const addItem = useMutation(api.carts.mutations.index.addItem)
  const product = useQuery(
    api.products.queries.index.getProductById,
    { productId: item.productInfo.productId }
  )

  // note input is uncontrolled; saving on blur

  async function handleDec () {
    await updateQty({
      cartId: cartId,
      productId: item.productInfo.productId,
      variantId: item.variantId,
      quantity: Math.max(0, item.quantity - 1),
    })
  }

  async function handleInc () {
    await updateQty({
      cartId: cartId,
      productId: item.productInfo.productId,
      variantId: item.variantId,
      quantity: Math.min(item.quantity + 1, item.productInfo.inventory),
    })
  }

  

  async function handleRemove () {
    try {
      await promiseToast(
        updateQty({
          cartId: cartId,
          productId: item.productInfo.productId,
          variantId: item.variantId,
          quantity: 0,
        }),
        { loading: 'Removing item…', success: 'Item removed', error: () => 'Failed to remove item' },
      )
    } catch {
      // no-op
    }
  }

  // note saved inline onBlur; no separate save handler

  async function handleVariantChange (newVariantId?: string) {
    if ((newVariantId ?? null) === (item.variantId ?? null)) return
    await updateQty({
      cartId: cartId,
      productId: item.productInfo.productId,
      variantId: item.variantId,
      quantity: 0,
    })
    await addItem({
      cartId: cartId,
      productId: item.productInfo.productId,
      variantId: newVariantId,
      quantity: item.quantity,
      selected: item.selected,
      note: item.note,
    })
  }

  return (
    <Card className={cn(item.selected && 'border-primary')}>
      <CardContent className={cn('p-3', item.selected && 'bg-primary/5')}>
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <Checkbox
              checked={item.selected}
              onCheckedChange={async (checked) => {
                await setSelected({
                  cartId: cartId,
                  productId: item.productInfo.productId,
                  variantId: item.variantId,
                  selected: Boolean(checked),
                })
              }}
              aria-label="Select item"
            />
          </div>
          {item.productInfo.imageUrl?.[0] ? (
            <R2Image
              fileKey={item.productInfo.imageUrl[0]}
              alt={item.productInfo.title}
              width={96}
              height={96}
              className="h-12 w-12 shrink-0 rounded object-cover bg-secondary"
            />
          ) : (
            <div className="h-12 w-12 shrink-0 rounded bg-secondary" />
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-medium leading-tight">
                  {item.productInfo.title}
                </div>
                {product && (product.variants?.length ?? 0) > 0 && (
                  <div className="mt-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-between md:w-64"
                          aria-label="Select variant"
                        >
                          {item.productInfo.variantName ?? 'Select a variant'}
                          <span aria-hidden>▾</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="min-w-[12rem]">
                        <DropdownMenuRadioGroup
                          value={item.variantId ?? ''}
                          onValueChange={(val) => handleVariantChange(val || undefined)}
                        >
                          {product.variants
                            .filter((v) => v.isActive)
                            .map((v) => (
                              <DropdownMenuRadioItem key={v.variantId} value={v.variantId}>
                                {v.variantName} • ${v.price.toFixed(2)}
                              </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
                <div className="mt-1 text-xs text-muted-foreground">
                  ${item.productInfo.price.toFixed(2)} each
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">
                  ${(item.productInfo.price * item.quantity).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={handleDec} aria-label="Decrease quantity"><Minus className="h-4 w-4" /></Button>
                <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                <Button variant="secondary" size="sm" onClick={handleInc} aria-label="Increase quantity"><Plus className="h-4 w-4" /></Button>
              </div>
              <Separator orientation="vertical" className="mx-2 h-5" />
              <Button variant="ghost" size="sm" onClick={handleRemove}><Trash2 className="mr-2 h-4 w-4" /> Remove</Button>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <Input
                defaultValue={item.note ?? ''}
                placeholder="Add a note (optional)"
                className="max-w-md"
                onBlur={async (e) => {
                  try {
                    await setItemNote({
                      cartId: cartId,
                      productId: item.productInfo.productId,
                      variantId: item.variantId,
                      note: e.target.value.trim() || undefined,
                    })
                    showToast({ type: 'success', title: 'Note saved' })
                  } catch {
                    showToast({ type: 'error', title: 'Failed to save note' })
                  }
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


