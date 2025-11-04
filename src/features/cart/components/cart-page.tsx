"use client"

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { R2Image } from '@/src/components/ui/r2-image'
import { showToast, promiseToast } from '@/lib/toast'
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react'
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
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-4">
          {new Array(3).fill(null).map((_, i) => (
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

  if (!cart || !hasItems) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-24 w-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Browse products and add items to your cart.</p>
          <Link href="/">
            <Button className="hover:scale-105 transition-all duration-200">Continue shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Your cart</h1>
        <p className="text-muted-foreground mt-1">{totals.totalItems} items</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(groupedByOrg).map(([orgId, group]) => (
            <div key={orgId} className="space-y-3">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
                {group.name}
              </div>
              {group.items.map((item) => (
                <CartLineItem
                  key={`${String(item.productInfo.productId)}::${item.productInfo.variantName ?? 'default'}`}
                  cartId={cart._id}
                  item={item}
                />
              ))}
            </div>
          ))}

          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handleClear}
              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Clear cart
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Items ({totals.totalItems})</span>
                  <span>{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(totals.totalValue)}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between font-bold text-lg">
                  <span>Selected total</span>
                  <span className="text-primary">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(totals.selectedValue)}</span>
                </div>

                <Link href="/checkout">
                  <Button
                    className="w-full h-10 hover:scale-105 transition-all duration-200"
                    disabled={totals.selectedItems === 0}
                  >
                    Checkout ({totals.selectedItems} items)
                  </Button>
                </Link>
              </div>
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
    <Card className={cn('transition-all duration-200', item.selected && 'border-primary bg-primary/5 shadow-sm')}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="pt-1">
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
              className="mt-0.5"
            />
          </div>

          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
            {item.productInfo.imageUrl?.[0] ? (
              <R2Image
                fileKey={item.productInfo.imageUrl[0]}
                alt={item.productInfo.title}
                width={64}
                height={64}
                className="h-full w-full object-cover bg-secondary"
              />
            ) : (
              <div className="h-full w-full bg-secondary rounded-lg" />
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold leading-tight">
                  {item.productInfo.title}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(item.productInfo.price)} each
                </div>
                {product && (product.variants?.length ?? 0) > 0 && (
                  <div className="mt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs justify-between border-muted hover:border-primary/30 bg-white"
                          aria-label="Select variant"
                        >
                          <span className="truncate">
                            {item.productInfo.variantName ?? 'Select variant'}
                          </span>
                          <span aria-hidden className="ml-1">▾</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="min-w-[10rem] animate-in fade-in-0 zoom-in-95">
                        <DropdownMenuRadioGroup
                          value={item.variantId ?? ''}
                          onValueChange={(val) => handleVariantChange(val || undefined)}
                        >
                          {product.variants
                            .filter((v) => v.isActive)
                            .map((v) => (
                              <DropdownMenuRadioItem key={v.variantId} value={v.variantId} className="text-xs">
                                <div className="flex items-center justify-between w-full">
                                  <span>{v.variantName}</span>
                                  <span className="ml-2 font-medium text-primary">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(v.price)}</span>
                                </div>
                              </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(item.productInfo.price * item.quantity)}</div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDec}
                  aria-label="Decrease quantity"
                  className="h-7 w-7 p-0 hover:bg-primary/10 bg-white"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="min-w-8 text-center text-sm font-medium">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInc}
                  aria-label="Increase quantity"
                  className="h-7 w-7 p-0 hover:bg-primary/10 bg-white"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3 mr-1" /> Remove
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Input
                defaultValue={item.note ?? ''}
                placeholder="Add a note..."
                className="h-7 text-xs max-w-xs"
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


